import { Optional } from "@nestjs/common"
import { IsInt, IsString } from "class-validator"


export class EditBookmarkDto {
    @Optional()
    @IsString()
    title?: string

    @Optional()
    @IsString()
    description?: string

    @Optional()
    @IsString()
    link?: string

}