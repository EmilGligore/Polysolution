import "../index.css";
import SideBar from "./SideBar";
import UserDetails from "./UserDetails";
import Schedule from "./Schedule";
import Stock from "./Stock";
import Auth from "./Auth";

export default function Main() {
  return (
    <main className="flex h-screen">
      <SideBar />
      <Schedule />
    </main>
    // <main className="flex h-screen">
    //
    /* <UserDetails /> */

    /* <Stock /> */
    //
  );
}
