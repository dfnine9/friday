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
            // Find sidecar script — try bundled path first, then dev paths
            let resource_dir = app.path().resource_dir().unwrap_or_default();
            let candidates = vec![
                resource_dir.join("server.mjs"),
                resource_dir.join("sidecar").join("dist").join("server.mjs"),
                std::path::PathBuf::from("sidecar/dist/server.mjs"),
            ];

            let script = candidates.iter()
                .find(|p| p.exists())
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| "sidecar/dist/server.mjs".to_string());

            // Spawn sidecar with full environment passthrough
            match Command::new("node")
                .arg(&script)
                .envs(std::env::vars())
                .spawn()
            {
                Ok(child) => {
                    let state = app.state::<SidecarProcess>();
                    *state.0.lock().unwrap() = Some(child);

                    // Poll health endpoint until ready (max 10 seconds)
                    for i in 0..20 {
                        std::thread::sleep(std::time::Duration::from_millis(500));
                        if let Ok(resp) = std::process::Command::new("curl")
                            .args(["-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:3141/health"])
                            .output()
                        {
                            if String::from_utf8_lossy(&resp.stdout).contains("200") {
                                println!("Friday sidecar ready ({}ms)", (i + 1) * 500);
                                break;
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Sidecar failed: {}. Running in web-only mode.", e);
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Some(state) = window.try_state::<SidecarProcess>() {
                    if let Some(mut child) = state.0.lock().unwrap().take() {
                        let _ = child.kill();
                        let _ = child.wait();
                        println!("Friday sidecar stopped");
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running friday");
}
