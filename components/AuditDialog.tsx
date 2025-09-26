"use client"

import React, {useState, useEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {Newspaper, Calendar, User, Hash, FileText, Loader2, AlertCircle, Timer, Clock} from "lucide-react";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {auditService, AuditTrailListResponse} from "@/services/auditService";
import {Spinner} from "@/components/ui/spinner";

type AuditDialogProps = {
    id: string | number;
    type: string;
    dropdownMsg?: string;
}

const AuditDialog = ({id, type, dropdownMsg = "Lihat Audit Trail"}: AuditDialogProps) => {
    const [auditLogs, setAuditLogs] = useState<AuditTrailListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchAuditLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await auditService.getAuditLogsByIdAndType(String(id), type);
            setAuditLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAuditLogs();
        }
    }, [isOpen, id, type]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);


        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes} WIB`;
    };

    const formatDateOnly = (timestamp: string) => {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-GB", {month: "short"});
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const isSameDate = (timestamp1: string, timestamp2: string) => {
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        return date1.toDateString() === date2.toDateString();
    };

    const renderAuditLogs = () => {
        if (!auditLogs || auditLogs.items.length === 0) return null;

        const elements: any[] = [];

        auditLogs.items.forEach((log, index) => {
            const isFirstItem = index === 0;
            const prevLog = index > 0 ? auditLogs.items[index - 1] : null;
            const showDateSeparator = isFirstItem || (prevLog && !isSameDate(log.timestamp, prevLog.timestamp));

            if (showDateSeparator) {
                elements.push(
                    <div key={`date-${log.timestamp}-${index}`} className="flex items-center gap-2 py-2">

                        <span className="text-xs font-medium text-muted-foreground bg-background px-2">
                            {formatDateOnly(log.timestamp)}
                        </span>
                        <div className="h-px bg-border flex-1"></div>
                    </div>
                );
            }

            elements.push(
                <div
                    key={log.id}
                    className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-medium text-sm mb-2">
                                {log.description}
                            </p>

                            <div className="flex flex-wrap  gap-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3"/>
                                    <span>{log.user_name}</span>
                                </div>
                                <span className={"mx-1"}>|</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3"/>
                                    <span className={"text-xs"}>{formatTimestamp(log.timestamp)}</span>
                                </div>


                            </div>
                        </div>


                    </div>
                </div>
            );
        });

        return elements;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Newspaper className="mr-2 h-4 w-4"/>
                    {dropdownMsg}
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5"/>
                        Audit Trail
                    </DialogTitle>
                    <DialogDescription>
                        Riwayat perubahan untuk {type.toLowerCase()} ID: {id}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 mt-4">
                    {loading && (
                        <Spinner/>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {auditLogs && !loading && !error && (
                        <>
                            <div className="mb-4 text-sm text-muted-foreground">
                                Total: {auditLogs.total} entri
                            </div>

                            <ScrollArea className="h-[300px] w-full pr-4">
                                {auditLogs.items.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                                        <p>Tidak ada audit log ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {renderAuditLogs()}
                                    </div>
                                )}
                            </ScrollArea>

                            {auditLogs.total > auditLogs.limit && (
                                <div className="mt-4 text-xs text-muted-foreground text-center">
                                    Menampilkan {auditLogs.items.length} dari {auditLogs.total} total entri
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuditDialog;