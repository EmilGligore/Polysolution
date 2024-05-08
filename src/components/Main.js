import "../index.css";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Auth from "./Auth";
import Beds from "./Beds";

export default function Main() {
  return (
    <main className="flex h-screen w-full">
      <SideBar />
      {/* <Stock /> */}
      <Beds />
    </main>
    // <main className="flex h-screen">
    //
    /* <UserDetails /> */

    /* <Stock /> */
    //
  );
}
