import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const OwnerCategoryDialog = ({ open, setOpen, onSave, category }) => {
    const [name, setName] = useState('');

    React.useEffect(() => {
        if (category) {
            setName(category.name);
        } else {
            setName('');
        }
    }, [category]);

    const handleSave = () => {
        onSave({ id: category?.id, name });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] glassmorphic">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the category name.' : 'Add a new category for your personal expenses.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OwnerCategoryDialog;