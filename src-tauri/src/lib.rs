use tauri::Manager;
use std::process::{Command, Child};
use std::sync::Mutex;

struct SidecarProcess(Mutex<Option<Child>>);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("On it, {}. Friday is ready.", name)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarProcess(Mutex::new(None)))
        .setup(|app| {
            // Launch Node.js sidecar for AI backend
            let resource_dir = app.path().resource_dir().unwrap_or_default();
            let sidecar_path = resource_dir.join("sidecar").join("dist").join("server.cjs");

            // Try bundled sidecar first, fall back to development path
            let script = if sidecar_path.exists() {
                sidecar_path.to_string_lossy().to_string()
            } else {
                // Development mode — sidecar at project root
                String::from("sidecar/dist/server.cjs")
            };

            match Command::new("node").arg(&script).spawn() {
                Ok(child) => {
                    let state = app.state::<SidecarProcess>();
                    *state.0.lock().unwrap() = Some(child);
                    println!("Friday sidecar started");

                    // Wait briefly for sidecar to be ready
                    std::thread::sleep(std::time::Duration::from_secs(2));
                }
                Err(e) => {
                    eprintln!("Sidecar failed to start: {}. Running in web-only mode.", e);
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Kill sidecar when window closes
                if let Some(state) = window.try_state::<SidecarProcess>() {
                    if let Some(mut child) = state.0.lock().unwrap().take() {
                        let _ = child.kill();
                        println!("Friday sidecar stopped");
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running friday");
}
