import { useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import logo from "../../assets/logo.png";
import "../../globals.css";
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
        <ul className="  flex justify-between items-center h-full gap-10">
          <li className="">Bot xususiyatlari</li>
          <li className="">Bizning mijozlar</li>
          <li className="">Fikrlar</li>
          <li className="">Ko'p beriladigan savollar</li>
        </ul>
      </div>
      <div className=" flex items-center ">
        <div className="mr-4 flex items-center ">
          
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
