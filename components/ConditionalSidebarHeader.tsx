import { SidebarHeader } from "./sidebar-header";
import { useSidebar } from "./ui/sidebar";
const ConditionalSidebarHeader = () => {
  const { state } = useSidebar(); // "collapsed" or "expanded"
  const isOpen = state !== "collapsed";

  return <SidebarHeader open={isOpen} />;
};

export default ConditionalSidebarHeader;
