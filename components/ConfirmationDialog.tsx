import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Minus} from "lucide-react";
import React from "react";


type ConfirmationDialogType = {
    title: string
    description: string
    handleOnClick: () => void
}

export const ConfirmationDialog = ({title, description, handleOnClick}: ConfirmationDialogType) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"

                    className="px-2"
                >
                    <Minus className="w-4 h-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant={"outline"}>Tidak</Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={handleOnClick}
                    >
                        Ya
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}