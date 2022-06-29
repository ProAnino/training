import { Optional } from "@nestjs/common"
import { IsInt, IsNotEmpty, IsString } from "class-validator"


export class CreateBookmarkDto {

    @IsString()
    @IsNotEmpty()
    title: string

    @Optional()
    @IsString()
    description?: string

    @IsString()
    @IsNotEmpty()
    link: string

}