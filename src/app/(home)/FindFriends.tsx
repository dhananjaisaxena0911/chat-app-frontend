import { cookies } from "next/headers";
import FindFriendsPage from "./FindFriends/page";

export default async function FindFriendsWrapper() {
  return <FindFriendsPage />;
}
