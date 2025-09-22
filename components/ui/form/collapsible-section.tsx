import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type ReactNode, useState, useEffect } from 'react';

interface CollapsibleSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    keepContentMounted?: boolean; // New prop to keep content mounted
}

export function CollapsibleSection({
    title,
    description,
    children,
    defaultOpen = false,
    onOpenChange,
    className = '',
    headerClassName = '',
    contentClassName = '',
    variant = 'default',
    size = 'md',
    keepContentMounted = true // Default to true for forms
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen);

    useEffect(() => {
        if (isOpen && !hasBeenOpened) {
            setHasBeenOpened(true);
        }
    }, [isOpen, hasBeenOpened]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const variantClasses = {
        default: 'border shadow-sm',
        ghost: 'border-0 shadow-none',
        outline: 'border-2 shadow-none'
    };

    return (
        <Collapsible open={isOpen} onOpenChange={handleOpenChange} className={className}>
            <Card className={`${variantClasses[variant]} transition-all duration-200 ${className}`}>
                <CollapsibleTrigger asChild>
                    <CardHeader
                        className={`
              cursor-pointer hover:bg-muted/50 transition-colors duration-200 
              ${headerClassName}
            `}>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <h3 className={`font-semibold tracking-tight ${sizeClasses[size]}`}>{title}</h3>
                                {description && <p className='text-sm text-muted-foreground'>{description}</p>}
                            </div>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                {isOpen ? (
                                    <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                                ) : (
                                    <ChevronRight className='h-4 w-4 transition-transform duration-200' />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                {/* Conditionally render content based on keepContentMounted */}
                {(keepContentMounted ? hasBeenOpened : isOpen) && (
                    <CollapsibleContent
                        className={
                            'transition-all duration-200 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'
                        }
                        style={keepContentMounted && !isOpen ? { display: 'none' } : undefined}>
                        <CardContent className={`pt-0 ${contentClassName}`}>{children}</CardContent>
                    </CollapsibleContent>
                )}
            </Card>
        </Collapsible>
    );
}
