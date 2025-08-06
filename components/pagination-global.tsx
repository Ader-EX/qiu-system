import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";
import React from "react";

type GlobalPaginationInt = {
    page: number;
    total: number;
    totalPages: number;
    rowsPerPage: number;
    handleRowsPerPageChange: (i: number) => void;
    handlePageChange: (i: number) => void;
    isSmall?: boolean;
};

const GlobalPaginationFunction = ({
                                      page,
                                      total,
                                      totalPages,
                                      rowsPerPage,
                                      handleRowsPerPageChange,
                                      handlePageChange,
                                      isSmall = false
                                  }: GlobalPaginationInt) => {
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Baris per halaman:</span>
                <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(val) => handleRowsPerPageChange(Number(val))}
                >
                    <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder={rowsPerPage.toString()}/>
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50].map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                                {n}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {!isSmall &&
                <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Halaman {page} dari {totalPages} ({total} total)
        </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>
            }

        </div>
    );
};

export default GlobalPaginationFunction;
