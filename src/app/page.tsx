import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8'>
      <header className='text-center mb-12'>
        <h1 className='text-5xl font-extrabold text-gray-900 dark:text-white mb-4'>
          Welcome to Code Review AI Agent
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
          Your intelligent partner for enhancing code quality, security, and performance.
        </p>
      </header>

      <main className='text-center mb-12'>
        <p className='text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-xl mx-auto'>
          Leverage the power of AI to get detailed code analysis, identify potential issues, and receive actionable feedback instantly. Streamline your development workflow and ship better code, faster.
        </p>
        <Link href="/codereview">
          <button className='px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1'>
            Start Reviewing Code
          </button>
        </Link>
      </main>

      <footer className='text-center text-gray-500 dark:text-gray-400 mt-12'>
        <p>&copy; {new Date().getFullYear()} Code Review AI Agent. Built with Next.js and Tailwind CSS.</p>
      </footer>
    </div>
  );
}