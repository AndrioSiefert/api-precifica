import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePurchaseBatchDto {
    @IsDateString()
    @IsNotEmpty()
    purchasedOn: string

    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    notes?: string;
}