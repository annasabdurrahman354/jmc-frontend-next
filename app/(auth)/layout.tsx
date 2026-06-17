import Image from "next/image";

export const metadata = {
  title: "Login - Admin JMC",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden overflow-hidden lg:block">
        <Image
          src="/images/login/work01.jpeg"
          alt="Login Cover"
          fill
          priority
          className="object-cover"
        />
        <div className="bg-linear-to-t from-black/80 via-black/20 to-transparent absolute inset-0" />
        <div className="absolute bottom-10 left-10 z-10 max-w-md text-white">
          <h2 className="text-3xl font-bold leading-tight">
            Solusi Digital untuk Manajemen Kepegawaian Modern
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Kelola data pegawai, tunjangan, dan akses pengguna dalam satu
            platform terpadu.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

