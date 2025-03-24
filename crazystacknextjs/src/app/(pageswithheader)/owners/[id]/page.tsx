import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeftIcon, MapPinIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneItem } from "@/shared/ui/molecules";
import { getOwnerByIdPublic } from "@/slices/belezix/entidades/owner/owner.api";
import { whitelabel } from "@/application/whitelabel";
import { parseCookies } from "@/shared/libs/utils";
import { AppointmentService } from "../_components/appointment-service";
import { getCookies } from "@/shared/libs/utils/cookies";

export const metadata: Metadata = {
  title: `${whitelabel.systemName} | Detalhes do Estabelecimento`,
  description: `Página de detalhes de estabelecimentos do ${whitelabel.systemName}. Aqui você pode agendar com os melhores estabelecimentos da cidade.`,
};

async function getParsedCookies() {
  const cookies = await getCookies();
  if (!cookies) {
    return null;
  }
  const parsedCookies = parseCookies(cookies);
  if (!parsedCookies?.["belezixclient.token"]) {
    return null;
  }
  return parsedCookies;
}

export default async function Page({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookies = await getParsedCookies();
  const param = await params;
  const ownerId = Array.isArray(param.id) ? param.id[0] : param.id;
  if (!ownerId) {
    throw new Error("Owner ID is missing");
  }
  const owner = await getOwnerByIdPublic(ownerId, cookies);
  if (!owner) {
    return null;
  }

  return (
    //<div className="max-w-4xl mx-auto">
    <div>
      <div className="relative h-[250px] w-full">
        <Image
          alt={owner.name}
          src={
            owner?.place?.cover ??
            "https://images.unsplash.com/photo-1619367901998-73b3a70b3898?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          fill
          className="object-cover"
        />
        <Button
          variant="secondary"
          className="absolute top-4 left-4 z-10"
          size="icon"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <div className="absolute mb-8 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <Avatar className="w-48 h-48 border-4 border-background">
            <AvatarImage src={owner?.place?.profilephoto} alt={owner.name} />
            <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="border-b border-solid p-5 pt-16">
        <h1 className="mb-3 text-xl font-bold">{owner.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{owner?.place?.address ?? "Sem endereço"}</p>
        </div>
        <div className="flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">4,7 (899 avaliações)</p>
        </div>
      </div>
      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Sobre nós</h2>
        <p className="text-sm">
          {owner?.description ??
            owner?.place?.description ??
            "Não tem descrição"}
        </p>
      </div>
      <div className="space-y-3 p-5">
        {owner?.place?.phone && <PhoneItem phone={owner?.place?.phone} />}
      </div>
      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3 max-w-4xl mx-auto">
          {owner?.services?.map?.((service: any, index: number) => (
            <React.Fragment key={service._id ?? index}>
              <AppointmentService
                owner={JSON.parse(JSON.stringify(owner))}
                service={JSON.parse(JSON.stringify(service))}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
