import { useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import logo from "../../assets/logo.png";
import "./navbar.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

const Navbar = () => {
  const [flagSelected, setFlagSelected] = useState("UZ");

  return (
    <div className=" border-b h-20 flex mx-auto xl:justify-between justify-around">
      <div className="flex items-center gap-2">
        <img className="h-10" src={logo} alt="logo" />
        <h2 className=" text-xl font-medium">TrueGis</h2>
      </div>
      <div className=" xl:block sm:hidden">
        <ul className=" flex justify-between items-center h-full gap-10">
          <li>Bot xususiyatlari</li>
          <li>Bizning mijozlar</li>
          <li>Fikrlar</li>
          <li>Ko'p beriladigan savollar</li>
        </ul>
      </div>
      <div className=" flex items-center ">
        <div className="mr-4 flex items-center ">
          <ReactFlagsSelect
            className="h-11"
            selectButtonClassName="rfs-btn"
            countries={["US", "GB", "UZ"]}
            customLabels={{
              US: "English",
              GB: "Germany",
              UZ: "Uzbek",
            }}
            placeholder="Select Language"
            selected={flagSelected}
            onSelect={(code) => setFlagSelected(code)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger >
            <HamburgerMenuIcon className="size-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
