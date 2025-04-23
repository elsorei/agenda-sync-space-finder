
import { UserSelection } from "./UserSelection";
import { User } from "@/types";

interface EventDialogGuestsProps {
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
  isReadOnly: boolean;
}

export const EventDialogGuests = ({
  users,
  selectedUserIds,
  onToggleUser,
  isReadOnly
}: EventDialogGuestsProps) => (
  <UserSelection
    users={users}
    selectedUserIds={selectedUserIds}
    onToggleUser={onToggleUser}
    isReadOnly={isReadOnly}
  />
);
