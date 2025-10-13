"use client";

import {LogOut} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {SidebarMenu, SidebarMenuItem} from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";

export function NavUser({
                            user,
                        }: {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}) {
    const router = useRouter();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-md font-medium text-sidebar-foreground">
                {user.name}
              </span>
                            <span className="text-sm font-bold text-sidebar-foreground">
                {user.email}
              </span>
                        </div>
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                Cookies.remove("access_token");
                                Cookies.remove("refresh_token");
                                Cookies.remove("role");
                                Cookies.remove("name");
                                Cookies.remove("token_type");
                                router.push("/login");
                            }}
                            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <LogOut className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
