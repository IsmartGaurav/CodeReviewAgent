import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (path) {
    // Get specific file content
    try {
      const { stdout } = await execAsync(`powershell -Command "Get-Content -Path '${path}'"`);
      return NextResponse.json({ content: stdout });
    } catch (error) {
      console.error("Error fetching file content:", error);
      return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 });
    }
  } else {
    // Get all files
    try {
      const { stdout } = await execAsync(
        'powershell -Command "Get-ChildItem -Path . -Recurse -File | Where-Object { ' +
        '$_.FullName -notlike \'*\\.git\\*\' -and ' +
        '$_.FullName -notlike \'*\\.next\\*\' -and ' +
        '$_.FullName -notlike \'*\\node_modules\\*\' -and ' +
        '$_.FullName -notlike \'*\\public\\*\' -and ' +
        '$_.FullName -notlike \'*\\convex\\*\' -and ' +
        '$_.Name -notlike \'.env*\' -and ' +
        '$_.Name -ne \'.gitignore\' -and ' +
        '$_.Name -ne \'package.json\' -and ' +
        '$_.Name -ne \'package-lock.json\' -and ' +
        '$_.Name -ne \'next.config.js\' -and ' +
        '$_.Name -ne \'next-env.d.ts\' -and ' +
        '$_.Name -ne \'favicon.ico\' ' +
        '} | ForEach-Object { $_.FullName.Substring($PWD.Path.Length + 1) }"'
      );

      const files = stdout
        .split("\r\n")
        .filter((file) => file.trim() !== "")
        .map((file) => file.trim());

      return NextResponse.json({ files });
    } catch (error) {
      console.error("Error listing files:", error);
      return NextResponse.json({ files: [] });
    }
  }
} 