import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo_new_b.png"
      alt="Dunamenti CSZ Kft."
      width={90}
      height={26}
      className="h-auto w-[90px]"
      priority
    />
  );
}
