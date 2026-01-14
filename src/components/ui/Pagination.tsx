import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-8 w-8 p-0"
            >
                <ChevronLeft size={16} />
            </Button>

            <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
            </span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 w-8 p-0"
            >
                <ChevronRight size={16} />
            </Button>
        </div>
    );
}
