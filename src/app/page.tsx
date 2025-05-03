import { ReviewClient } from "@/components/review-client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const getAllFilesFromGit = async () => {
  try {
    // List source code files, excluding configuration and generated files
    const { stdout } = await execAsync(
      'powershell -Command "Get-ChildItem -Path . -Recurse -File | Where-Object { ' +
      // Exclude directories
      '$_.FullName -notlike \'*\\.git\\*\' -and ' +
      '$_.FullName -notlike \'*\\.next\\*\' -and ' +
      '$_.FullName -notlike \'*\\node_modules\\*\' -and ' +
      '$_.FullName -notlike \'*\\public\\*\' -and ' +
      '$_.FullName -notlike \'*\\convex\\*\' -and ' +
      // Exclude specific file types and names
      '$_.Name -notlike \'.env*\' -and ' +
      '$_.Name -ne \'.gitignore\' -and ' +
      '$_.Name -ne \'package.json\' -and ' +
      '$_.Name -ne \'package-lock.json\' -and ' +
      '$_.Name -ne \'next.config.js\' -and ' +
      '$_.Name -ne \'next-env.d.ts\' -and ' +
      '$_.Name -ne \'favicon.ico\' ' +
      '} | ForEach-Object { $_.FullName.Substring($PWD.Path.Length + 1) }"'
    );

    // Process the output to get file names
    const files = stdout
      .split("\r\n") // Windows uses CRLF line endings
      .filter((file) => file.trim() !== "")
      .map((file) => file.trim());

    return { files };
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

async function getSelectedFile(filePath: string) {
  try {
    if (!filePath) {
      return { error: "File path is required" };
    }

    const { stdout } = await execAsync(`powershell -Command "Get-Content -Path '${filePath}'"`);

    return { content: stdout };
  } catch (error) {
    console.error("Error fetching file content:", error);
    return { error: "Failed to fetch file content" };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const data = await getAllFilesFromGit();
  const selectedFile = await getSelectedFile(path);

  console.log(data);

  return (
    <div className=''>
      <header className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Code Review AI Agent</h1>
      </header>

      <div className='page-container'>
        <h2 className='text-xl font-bold'>
          Hi! I&apos;m Code Review Agent, your personal code review AI agent.
        </h2>
        <p>
          I&apos;m here to help you review your code. I&apos;ll give you a
          detailed analysis of the code, including security vulnerabilities,
          code style, and performance optimizations.
        </p>
        <ReviewClient
          files={data?.files || []}
          selectedFile={selectedFile}
          file={path}
        />
      </div>
    </div>
  );
}
