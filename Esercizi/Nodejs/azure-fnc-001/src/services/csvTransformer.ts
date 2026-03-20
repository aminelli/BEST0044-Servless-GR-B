import { parse } from "csv-parse/sync";

export interface CsvRow {
  [key: string]: string | number | boolean; // | null;
}

export interface CsvParserOptions {
  // Delimiter character, default is comma (,)
  delimiter?: string;
  // Se true, usa la prima riga come intestazione e restituisce un array di oggetti
  columns?: boolean | string[];
  // Se true, ignora le righe vuote
  skip_empty_lines?: boolean;
  // Se true, rimuove gli spazi bianchi all'inizio e alla fine dei campi
  trim?: boolean;
  // Se true, rimuove gli spazi bianchi all'inizio e alla fine dei campi, ma solo se non sono racchiusi tra virgolette
  trimValues?: boolean;
  // Se true, consente campi racchiusi tra virgolette che contengono il delimitatore
  relax_column_count?: boolean;
  // Se true, consente campi racchiusi tra virgolette che contengono il delimitatore, ma solo se sono racchiusi tra virgolette
  skip_recorsds_with_error?: boolean;
}

export class CsvToJsonTransformer {
  public async stransform(
    csvContent: string,
    options?: CsvParserOptions,
  ): Promise<CsvRow[]> {
    try {
      if (
        !csvContent ||
        typeof csvContent !== "string" ||
        csvContent.trim().length === 0
      ) {
        throw new Error("Invalid CSV content");
      }

      const parserOptions: CsvParserOptions = {
        delimiter: options?.delimiter || ",",
        columns: options?.columns ?? true,
        skip_empty_lines: options?.skip_empty_lines ?? true,
        trim: options?.trim ?? true,
        trimValues: options?.trimValues ?? true,
        relax_column_count: options?.relax_column_count ?? true,
        skip_recorsds_with_error: options?.skip_recorsds_with_error ?? true,
      };

      const records = parse(csvContent, parserOptions) as unknown as CsvRow[];

      if (!Array.isArray(records) || records.length === 0) {
        throw new Error("No records found in CSV content");
      }
      return records;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error parsing CSV content: ${error.message}`);
      }
      throw new Error(`Unexpected error parsing CSV content:`);
    } finally {
    }
  }

  public toJsonString(data: CsvRow[], pretty: boolean = true): string {
    try {
      return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    } catch (error) {
      throw new Error(`Error converting data to JSON string: ${error.message}`);
    }
  }
}
