
export type Ticket = {
    createdAt?: Date;
    id?: string;
    subject?: string;
    body?: string;
    cleanedBody?: string;
    labelId: string; // Required, so no `?`
    label?: Label;
    confidenceScore?: number;
    isFAQ?: boolean;
    answer?: string;
    updatedAt?: Date;
};

export type Label = {
    id: string;
    name: string;
    description: string;
};
