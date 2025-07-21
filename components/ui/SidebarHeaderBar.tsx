"use client";

import * as React from "react";
import { PanelLeft, Plus, Upload } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderBarProps {
  title?: string;
  subtitle?: string;
  showToggle?: boolean;
  toggleVariant?: "default" | "minimal" | "rounded" | "pill";
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
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
      ...props
    },
    ref
  ) => {
    const { toggleSidebar } = useSidebar();

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
          <PanelLeft className="h-4 w-4" />
        </Button>
      );
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 py-4 ", className)}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showToggle && <SidebarToggle />}
          {leftContent}

          {/* Title Section */}
          {(title || subtitle) && (
            <div className="flex flex-col">
              {title && (
                <h1 className=" opacity-70 leading-none tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Custom children content */}
        {children && <div className="flex items-center gap-2">{children}</div>}

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">{rightContent}</div>
      </div>
    );
  }
);

SidebarHeaderBar.displayName = "SidebarHeaderBar";

// Pre-built action components for common use cases
const HeaderActions = {
  ImportButton: React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
  >(({ children, ...props }, ref) => (
    <Button ref={ref} variant="outline" size="sm" {...props}>
      <Upload className="h-4 w-4 mr-2" />
      {children || "Import"}
    </Button>
  )),

  AddButton: React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
  >(({ children, ...props }, ref) => (
    <Button ref={ref} size="sm" {...props}>
      <Plus className="h-4 w-4 mr-2" />
      {children || "Add Item"}
    </Button>
  )),

  ActionGroup: React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      />
    )
  ),
};

// Usage Examples Component
const SidebarHeaderExamples = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Basic with title */}
      <SidebarHeaderBar title="Items" />

      {/* With title and subtitle */}
      <SidebarHeaderBar title="Items" subtitle="Manage your items" />

      {/* With custom right content */}
      <SidebarHeaderBar
        title="Items"
        rightContent={
          <HeaderActions.ActionGroup>
            <HeaderActions.ImportButton />
            <HeaderActions.AddButton>Tambah Item</HeaderActions.AddButton>
          </HeaderActions.ActionGroup>
        }
      />

      {/* With custom left and right content */}
      <SidebarHeaderBar
        title="Items"
        leftContent={
          <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">I</span>
          </div>
        }
        rightContent={
          <HeaderActions.ActionGroup>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </HeaderActions.ActionGroup>
        }
      />

      {/* Custom children approach */}
      <SidebarHeaderBar title="Items">
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Item
          </Button>
        </div>
      </SidebarHeaderBar>

      {/* No toggle version */}
      <SidebarHeaderBar
        title="Items"
        showToggle={false}
        rightContent={
          <HeaderActions.ActionGroup>
            <HeaderActions.ImportButton />
            <HeaderActions.AddButton>Tambah Item</HeaderActions.AddButton>
          </HeaderActions.ActionGroup>
        }
      />
    </div>
  );
};

export { SidebarHeaderBar, HeaderActions, SidebarHeaderExamples };
