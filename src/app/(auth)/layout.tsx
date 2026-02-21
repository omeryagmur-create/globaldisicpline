import { Toaster } from "react-hot-toast";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020410] p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[100%] w-[100%] bg-[url('https://www.shadcnblocks.com/images/block/dots.svg')] opacity-20" />
            </div>

            <div className="relative z-10 w-full">
                {children}
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
}
