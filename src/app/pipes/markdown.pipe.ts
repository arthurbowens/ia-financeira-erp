import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    return value
      // Converter **texto** para <strong>texto</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Converter *texto* para <em>texto</em>
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Converter ### para h3
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      // Converter ## para h2
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h2>')
      // Converter # para h1
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-800">$1</h1>')
      // Converter • para <li> com espaçamento
      .replace(/^• (.*$)/gm, '<li class="mb-1">$1</li>')
      // Converter quebras de linha duplas para parágrafos
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Converter quebras de linha simples para <br>
      .replace(/\n/g, '<br>')
      // Envolver em parágrafo se não estiver
      .replace(/^(?!<[p|li|h])/gm, '<p class="mb-3">')
      .replace(/(?<!>)$/gm, '</p>')
      // Limpar parágrafos vazios
      .replace(/<p class="mb-3"><\/p>/g, '')
      // Converter listas com espaçamento
      .replace(/(<li class="mb-1">.*<\/li>)/gs, '<ul class="list-disc list-inside mb-3 space-y-1">$1</ul>')
      // Limpar <p> dentro de <ul>
      .replace(/<ul class="list-disc list-inside mb-3 space-y-1"><p class="mb-3">(<li class="mb-1">.*<\/li>)<\/p><\/ul>/gs, '<ul class="list-disc list-inside mb-3 space-y-1">$1</ul>')
      // Adicionar espaçamento entre seções
      .replace(/<\/h[1-3]>/g, '$&<div class="mb-2"></div>');
  }
}
