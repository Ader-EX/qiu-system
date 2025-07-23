"use client";

import * as React from "react";
import {PanelLeft, Plus, Upload, MoreVertical} from "lucide-react";
import {useSidebar} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";

interface SidebarHeaderBarProps {
    title?: string;
    subtitle?: string;
    showToggle?: boolean;
    toggleVariant?: "default" | "minimal" | "rounded" | "pill";
    children?: React.ReactNode;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
    mobileBreakpoint?: "sm" | "md" | "lg"; // When to switch to mobile layout
    collapseBehavior?: "dropdown" | "stack" | "hide"; // How to handle overflow on mobile
}

const SidebarHeaderBar = React.forwardRef<
    HTMLDivElement,
    SidebarHeaderBarProps
>(
    (
        {
            title,
            subtitle,
            showToggle = true,
            toggleVariant = "default",
            children,
            leftContent,
            rightContent,
            className,
            mobileBreakpoint = "md",
            collapseBehavior = "dropdown",
            ...props
        },
        ref
    ) => {
        const {toggleSidebar} = useSidebar();
        const [isMenuOpen, setIsMenuOpen] = React.useState(false);

        const SidebarToggle = () => {
            const variantClasses = {
                default: "h-8 w-8",
                minimal: "h-7 w-7",
                rounded: "h-8 w-8 rounded-full",
                pill: "h-9 w-9 rounded-full",
            };

            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className={cn("shrink-0", variantClasses[toggleVariant])}
                    aria-label="Toggle Sidebar"
                >
                    <PanelLeft className="h-4 w-4"/>
                </Button>
            );
        };

        // Mobile overflow menu for actions
        const MobileOverflowMenu = ({actions}: { actions: React.ReactNode }) => (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4"/>
                        <span className="sr-only">More actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <div className="p-1 space-y-1">
                        {actions}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        const breakpointClasses = {
            sm: {
                mobile: "sm:hidden",
                desktop: "hidden sm:flex",
                layout: "sm:flex-row",
                gap: "sm:gap-3",
            },
            md: {
                mobile: "md:hidden",
                desktop: "hidden md:flex",
                layout: "md:flex-row",
                gap: "md:gap-3",
            },
            lg: {
                mobile: "lg:hidden",
                desktop: "hidden lg:flex",
                layout: "lg:flex-row",
                gap: "lg:gap-3",
            },
        };

        const bp = breakpointClasses[mobileBreakpoint];

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center py-3 px-1",
                    // Base mobile layout - always stacked on mobile
                    "flex-col gap-2",
                    // Responsive layout
                    bp.layout,
                    bp.gap,
                    className
                )}
                {...props}
            >
                {/* Main header row */}
                <div className="flex items-center gap-2 w-full min-w-0">
                    {/* Left Section */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {showToggle && <SidebarToggle/>}
                        {leftContent && (
                            <div className="shrink-0">
                                {leftContent}
                            </div>
                        )}

                        {/* Title Section - responsive text sizing */}
                        {(title || subtitle) && (
                            <div className="flex flex-col min-w-0 flex-1">
                                {title && (
                                    <h1 className="text-sm sm:text-base font-medium opacity-70 leading-none tracking-tight truncate">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Section - responsive behavior */}
                    <div className="flex items-center gap-1 shrink-0 min-w-0">
                        {/* Desktop actions */}
                        <div className={cn("flex items-center gap-2 flex-wrap min-w-0", bp.desktop)}>
                            {rightContent}
                        </div>

                        {/* Mobile behavior based on collapseBehavior */}
                        {collapseBehavior === "dropdown" && rightContent && (
                            <div className={bp.mobile}>
                                <MobileOverflowMenu actions={rightContent}/>
                            </div>
                        )}

                        {collapseBehavior === "hide" && (
                            <div className={cn("flex items-center gap-1 flex-wrap min-w-0", bp.desktop)}>
                                {rightContent}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stacked mobile actions (when collapseBehavior is "stack") */}
                {collapseBehavior === "stack" && rightContent && (
                    <div className={cn("flex flex-wrap items-center gap-2 w-full justify-end", bp.mobile)}>
                        {rightContent}
                    </div>
                )}

                {/* Custom children content */}
                {children && (
                    <div className={cn(
                        "flex items-center gap-2 w-full justify-end",
                        // Hide children on mobile by default, show on desktop
                        bp.mobile,
                        "md:w-auto md:ml-auto"
                    )}>
                        {children}
                    </div>
                )}
            </div>
        );
    }
);

SidebarHeaderBar.displayName = "SidebarHeaderBar";

// Pre-built action components for common use cases with responsive sizing
const HeaderActions = {
    ImportButton: React.forwardRef<
        React.ElementRef<typeof Button>,
        React.ComponentProps<typeof Button> & { mobileSize?: "sm" | "icon" }
    >(({children, mobileSize = "sm", className, ...props}, ref) => (
        <Button
            ref={ref}
            variant="outline"
            size="sm"
            className={cn(
                // Responsive sizing
                mobileSize === "icon" && "w-8 h-8 p-0 sm:w-auto sm:h-9 sm:px-3",
                className
            )}
            {...props}
        >
            <Upload className={cn(
                "h-4 w-4",
                mobileSize !== "icon" && "mr-2 sm:mr-2",
                mobileSize === "icon" && "sm:mr-2"
            )}/>
            <span className={cn(
                mobileSize === "icon" && "hidden sm:inline"
            )}>
        {children || "Import"}
      </span>
        </Button>
    )),

    AddButton: React.forwardRef<
        React.ElementRef<typeof Button>,
        React.ComponentProps<typeof Button> & { mobileSize?: "sm" | "icon" }
    >(({children, mobileSize = "sm", className, ...props}, ref) => (
        <Button
            ref={ref}
            size="sm"
            className={cn(
                // Responsive sizing
                mobileSize === "icon" && "w-8 h-8 p-0 sm:w-auto sm:h-9 sm:px-3",
                className
            )}
            {...props}
        >
            <Plus className={cn(
                "h-4 w-4",
                mobileSize !== "icon" && "mr-2 sm:mr-2",
                mobileSize === "icon" && "sm:mr-2"
            )}/>
            <span className={cn(
                mobileSize === "icon" && "hidden sm:inline"
            )}>
        {children || "Add Item"}
      </span>
        </Button>
    )),

    ActionGroup: React.forwardRef<
        HTMLDivElement,
        React.ComponentProps<"div"> & {
        mobileLayout?: "horizontal" | "vertical" | "wrap";
        spacing?: "tight" | "normal" | "loose";
        allowWrap?: boolean;
    }
    >(({className, mobileLayout = "wrap", spacing = "normal", allowWrap = true, ...props}, ref) => {
        const spacingClasses = {
            tight: "gap-1",
            normal: "gap-2",
            loose: "gap-3"
        };

        const layoutClasses = {
            horizontal: "flex-row",
            vertical: "flex-col sm:flex-row",
            wrap: "flex-row flex-wrap"
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center",
                    spacingClasses[spacing],
                    layoutClasses[mobileLayout],
                    allowWrap && "flex-wrap",
                    className
                )}
                {...props}
            />
        );
    }),
};

// Usage Examples Component with responsive demos
const SidebarHeaderExamples = () => {
    return (
        <div className="space-y-6 p-4">
            <h2 className="text-lg font-semibold">Responsive SidebarHeaderBar Examples</h2>

            {/* Basic responsive example */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Basic with responsive title</h3>
                <SidebarHeaderBar
                    title="Items Management Dashboard"
                    subtitle="Manage all your items efficiently"
                />
            </div>

            {/* Dropdown behavior (default) */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">With dropdown overflow (mobile)</h3>
                <SidebarHeaderBar
                    title="Items"
                    subtitle="Manage your items"
                    collapseBehavior="dropdown"
                    rightContent={
                        <HeaderActions.ActionGroup>
                            <HeaderActions.ImportButton/>
                            <HeaderActions.AddButton>Add Item</HeaderActions.AddButton>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>

            {/* Wrap behavior with flex-wrap */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">With flex-wrap (prevents button cutoff)</h3>
                <SidebarHeaderBar
                    title="Items"
                    rightContent={
                        <HeaderActions.ActionGroup mobileLayout="wrap">
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2"/>
                                Import
                            </Button>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Item
                            </Button>
                            <Button variant="secondary" size="sm">
                                <Plus className="h-4 w-4 mr-2"/>
                                Export
                            </Button>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>

            {/* Vertical mobile layout */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Vertical mobile layout</h3>
                <SidebarHeaderBar
                    title="Items"
                    rightContent={
                        <HeaderActions.ActionGroup mobileLayout="vertical">
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2"/>
                                Import Data
                            </Button>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2"/>
                                Tambah Item Baru
                            </Button>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>

            {/* Icon-only mobile buttons */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">With icon-only mobile buttons</h3>
                <SidebarHeaderBar
                    title="Items"
                    rightContent={
                        <HeaderActions.ActionGroup>
                            <HeaderActions.ImportButton mobileSize="icon"/>
                            <HeaderActions.AddButton mobileSize="icon">Add Item</HeaderActions.AddButton>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>

            {/* Custom breakpoint */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Large breakpoint (lg)</h3>
                <SidebarHeaderBar
                    title="Items"
                    mobileBreakpoint="lg"
                    rightContent={
                        <HeaderActions.ActionGroup>
                            <HeaderActions.ImportButton/>
                            <HeaderActions.AddButton>Add Item</HeaderActions.AddButton>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>

            {/* Complex example with left content */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Complex responsive layout</h3>
                <SidebarHeaderBar
                    title="Project Dashboard"
                    subtitle="Track your progress"
                    leftContent={
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-medium">P</span>
                        </div>
                    }
                    rightContent={
                        <HeaderActions.ActionGroup>
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <Upload className="h-4 w-4 mr-2"/>
                                Import
                            </Button>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="h-4 w-4 mr-2 sm:mr-2"/>
                                <span className="hidden sm:inline">Add Project</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </HeaderActions.ActionGroup>
                    }
                />
            </div>
        </div>
    );
};

export {SidebarHeaderBar, HeaderActions, SidebarHeaderExamples};