// "use client";


// import { MasterEventCoe } from "@/types/coe/masterevent";
// import { Plus, X } from "lucide-react";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { MasterEventColumns } from "@/app/(root)/Sports/Masters/Events/_components/columns";
// import { GenericDataTable } from "@/components/ui/view-data-table/view-generic-data-table";
// import { useMasterEventCoe } from "@/hooks/coe/usemMaster";
// import AddMasterEventCoeForm from "../../masterevent/_components/add-form";

// export default function EventsTab() {
//     const { data: events, isLoading, refetch } = useMasterEventCoe();
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [selectedEvent, setSelectedEvent] = useState<MasterEventCoe | undefined>(undefined);

//     const handleEdit = (event: MasterEventCoe) => {
//         setSelectedEvent(event);
//         setIsFormOpen(true);
//     };

//     // Assuming MasterEventColumns is a function that returns an array of columns
//     // If it's a constant array, we might need to modify it or pass actions differently
//     // Let's assume for now it's exported correctly or adjust based on view_file below

//     return (
//         <div className="space-y-4">
//             {isFormOpen ? (
//                 <div className="relative border rounded-md p-4 bg-background">
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-2 top-2"
//                         onClick={() => { setIsFormOpen(false); setSelectedEvent(undefined); }}
//                     >
//                         <X className="h-4 w-4 mr-2" /> Close
//                     </Button>
//                     <h3 className="text-lg font-semibold mb-4">{selectedEvent ? "Edit Master Event" : "Add Master Event"}</h3>
//                     <AddMasterEventCoeForm
//                         initialData={selectedEvent}
//                         onSuccess={() => { setIsFormOpen(false); setSelectedEvent(undefined); refetch(); }}
//                     />
//                 </div>
//             ) : (
//                 <div className="flex justify-end">
//                     <Button onClick={() => { setSelectedEvent(undefined); setIsFormOpen(true); }}>
//                         <Plus className="h-4 w-4 mr-2" /> Add Master Event
//                     </Button>
//                 </div>
//             )}

//             <GenericDataTable
//                 columns={MasterEventColumns}
//                 data={events || []}
//                 isLoading={isLoading}
//                 searchKey="coemE_EventName"
//             />
//         </div>
//     );
// }
