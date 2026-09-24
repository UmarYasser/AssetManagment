// import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
// Load the model once at startup
import { AutoTokenizer, CLIPTextModelWithProjection, AutoProcessor, RawImage,CLIPVisionModelWithProjection } from '@huggingface/transformers';


@Injectable()
export class EmbeddingService implements OnModuleInit{
    constructor(
        private readonly prisma:PrismaService,
    ){}
    private tokenizer:any
    private textModel:any
    private processor:any
    private visionModel:any
    async onModuleInit() {
        this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/clip-vit-base-patch32');
        this.textModel = await CLIPTextModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');

        this.processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');
        this.visionModel = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');
    }


    // Just take the photo (form:) and return the vector
    async  embedImage(s3Url: string) {
        const image = await RawImage.fromURL(s3Url)
        const output = await this.processor(image);
        const {image_embeds} = await this.visionModel(output)
        const vector = image_embeds.data; // This is your Float32Array
        const vectorString = `[${Array.from(vector).join(",")}]`;
        return vectorString
    }

    async processText(searchTerm:string){
        const output = await this.tokenizer (searchTerm,{
            padding:true,
            truncation:true
        })
        const {text_embeds} = await this.textModel(output   )
        const vector = Array.from(text_embeds.data) // This is your Float32Array
        return `[${vector.join(',')}]`
    }
}