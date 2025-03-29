import { SubHeader } from "./_components/organisms/subheader";
import type { Metadata } from "next";
import { whitelabel } from "@/application/whitelabel";
import { parseCookies } from "@/shared/libs/utils";
import { getOwnersPublic } from "@/slices/belezix/entidades/owner/owner.api";
import { getRequests } from "@/slices/belezix/entidades/request/request.api";
import { startOfDay } from "date-fns";
import { HorizontalList } from "../_components/templates/horizontal-list";
import { TweetFormContainer } from "./_components/molecules/tweet-form";
import { TweetList } from "./_components/molecules/tweet-list";
import { getTweets } from "@/slices/belezix/entidades/tweet/tweet.api";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: `${whitelabel.systemName} | Agendamentos Online`,
  description: `Página de inicial do ${whitelabel.systemName}. Aqui você pode agendar com os melhores estabelecimentos da cidade.`,
};

async function getParsedCookies() {
  const cookieStore = (await cookies()).getAll();

  if (!cookieStore) {
    return null;
  }

  const parsedCookies = parseCookies(cookieStore);
  if (!parsedCookies?.["belezixclient.token"]) {
    return null;
  }
  return parsedCookies;
}

async function handleRequests(cookies: any) {
  try {
    const { requests, totalCount = 0 } = !cookies
      ? { requests: [], totalCount: 0 }
      : await getRequests(1, cookies, {
          initDate: startOfDay(new Date()).toISOString(),
          sortBy: "initDate",
          typeSort: "desc",
        });
    return { requests, totalCount };
  } catch (error: any) {
    return { requests: [], totalCount: 0 };
  }
}
async function handleTweets(cookies: any) {
  try {
    const { tweets = [], totalCount = 0 } = await getTweets(1, cookies, {
      sortBy: "createdAt",
      typeSort: "desc",
      tweetId: "null",
    });
    return { tweets, totalCount };
  } catch (error: any) {
    return { tweets: [], totalCount: 0 };
  }
}
const handleOwners = async (cookies: any) => {
  try {
    const popularOwners = await getOwnersPublic(1, cookies, {
      sortBy: "appointmentsTotal",
      typeSort: "desc",
    });
    const lastOwners = await getOwnersPublic(1, cookies, {
      sortBy: "createdAt",
      typeSort: "desc",
    });

    const owners = Array.isArray(popularOwners?.owners)
      ? popularOwners?.owners
      : [];
    const newOwners = Array.isArray(lastOwners?.owners)
      ? lastOwners?.owners
      : [];
    return { owners, newOwners };
  } catch (error: any) {
    return { owners: [], newOwners: [] };
  }
};
export default async function Page() {
  const cookies = await getParsedCookies();
  const { requests, totalCount } = await handleRequests(cookies);
  const { tweets, totalCount: countTweets } = await handleTweets(cookies);
  const { owners, newOwners } = await handleOwners(cookies);
  return (
    <main className="min-h-screen flex flex-col xl:flex-row justify-center mx-auto">
      <section className="flex flex-col w-full px-3 border-r-2 border-gray-900">
        <div className="xl:mx-16 my-5">
          <SubHeader />
          <HorizontalList
            title="Agendamentos"
            array={requests}
            type="appointment"
            widthCard={342}
          />
        </div>
        <div className="xl:mx-16">
          <HorizontalList
            title="Novos"
            array={newOwners}
            type="owner"
            widthCard={200}
          />
          <HorizontalList
            title="Populares"
            array={owners}
            type="owner"
            widthCard={200}
          />
        </div>
      </section>
      <section className="flex flex-col w-full">
        <div className="mx-10 xl:mx-16 my-10">
          <h2 className="text-xl font-bold font-inter">Feed</h2>
          <p>Veja os posts dos seus amigos e participe da conversa</p>
          <TweetFormContainer />
        </div>
        <div className="mx-10 xl:mx-16 flex flex-col items-center justify-center space-y-4">
          <TweetList initialTweets={tweets as any} countTweets={countTweets} />
        </div>
      </section>
    </main>
  );
}
