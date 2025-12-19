import { Bars3Icon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const AdminHeader = ({ toggleSidebar, openMobileSidebar }) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 bg-white border-b shadow-sm">
      <div className="flex-1 px-4 flex justify-end items-center">

        {/* MOBILE MENU */}
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* DESKTOP TOGGLE */}
        {/* <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button> */}

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">
          <BellIcon className="h-6 w-6 text-gray-500" />
          <UserCircleIcon className="h-8 w-8 text-gray-500" />
        </div>
      </div>
    </header>
  );
};
export default AdminHeader