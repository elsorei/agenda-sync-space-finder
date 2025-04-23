import DayView from "@/components/DayView";
import CalendarHeader from "@/components/CalendarHeader";
import UsersList from "@/components/UsersList";
import EventDialog from "@/components/event-dialog/EventDialog";
import FreeSlotFinder from "@/components/FreeSlotFinder";
import { useEventManager } from "@/hooks/useEventManager";

const Index = () => {
  const {
    currentDate,
    setCurrentDate,
    calendarView,
    setCalendarView,
    users,
    selectedUsers,
    setSelectedUsers,
    handleUserSelect,
    handleSelectAllUsers,
    events,
    handleAddEvent,
    handleEditEvent,
    handleSaveEvent,
    handleDeleteEvent,
    handleFindFreeSlots,
    handleCreateFromFreeSlot,
    refreshEvents,
    showFreeSlotFinder,
    setShowFreeSlotFinder,
    selectedEvent,
    setSelectedEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
  } = useEventManager();

  return (
    <div className="flex flex-col bg-background h-[calc(100vh-64px)] lg:h-screen">
      <CalendarHeader
        date={currentDate}
        onDateChange={setCurrentDate}
        view={calendarView}
        onViewChange={setCalendarView}
        onFindFreeSlots={handleFindFreeSlots}
        onRefresh={refreshEvents}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar with users */}
        <div className="border-r w-[250px] hidden lg:block">
          <UsersList
            users={users}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAllUsers}
          />
        </div>

        {/* Main calendar view */}
        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 p-4 ${showFreeSlotFinder ? 'w-2/3' : 'w-full'} overflow-hidden transition-all`}>
            {calendarView === 'day' && (
              <DayView
                date={currentDate}
                users={users.filter(user => selectedUsers.includes(user.id))}
                events={events}
                hourHeight={70}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
              />
            )}
          </div>
          {/* Free slot finder panel */}
          {showFreeSlotFinder && (
            <div className="w-1/3 p-4 overflow-y-auto animate-fade-in">
              <FreeSlotFinder
                users={users}
                events={events}
                selectedUsers={selectedUsers}
                date={currentDate}
                onSlotSelect={handleCreateFromFreeSlot}
              />
            </div>
          )}
        </div>
      </div>

      {/* Event dialog */}
      <EventDialog
        event={selectedEvent}
        users={users}
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default Index;
