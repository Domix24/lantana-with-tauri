// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command(async)]
async fn open_powershell() -> i8 {
  let command = tauri::api::process::Command::new("PowerShell")
    .args(["-ExecutionPolicy", "Bypass"])
    .args(["-File", "script.ps1"])
    .args(["-Action", "quit"])
    .spawn();

  if command.is_err() {
    return -1;
  } else {
    let (mut receiver, child) = command.unwrap();
    let mut got_stderr = false;
    let mut got_data = false;
    while let Some(event) = receiver.recv().await {
      if let tauri::api::process::CommandEvent::Stdout(line) = event {
        got_data = true;
        if line.starts_with("quit") {
          let _ = child.kill();
          break;
        }
      } else if let tauri::api::process::CommandEvent::Stderr(line) = event {
          got_stderr = true;
      }
    }
    if got_stderr {
      return -2;
    } else if !got_data {
      return -3;
    }
  }

  return 0;
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_powershell])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}