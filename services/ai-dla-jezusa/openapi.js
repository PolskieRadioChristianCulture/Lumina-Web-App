// =========================================================================
// AI DLA JEZUSA — OPENAPI 3.1 SPECIFICATION (ETAP 2)
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "AI DLA JEZUSA — Publiczne REST Search API",
    version: "1.0.0",
    description: "Otwarta, wielomodelowa warstwa dostępu do wiedzy biblijnej i zasobów Christian Culture. Działa w standardzie ZERO COST, Sola Scriptura, z jawnym cytowaniem licencjonowanych źródeł.",
    contact: {
      name: "Christian Culture / EkoCC",
      url: "https://polskieradio.cc"
    },
    license: {
      name: "Owned and Authorized by Christian Culture",
      url: "https://polskieradio.cc/zasady"
    }
  },
  servers: [
    {
      url: "https://polskieradio.cc/api/ai-dla-jezusa/v1",
      description: "Serwer produkcyjny (Cloudflare Edge)"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Stan zdrowia usługi",
        description: "Zwraca status usługi, liczbę zindeksowanych dokumentów oraz potwierdzenie działania w darmowym limicie (ZERO COST).",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Usługa sprawna",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", format: "date-time" },
                    index_documents: { type: "integer", example: 372 },
                    free_tier_status: { type: "string", example: "ZERO_COST_COMPLIANT" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/search": {
      get: {
        summary: "Wyszukiwanie w wiedzy Christian Culture",
        description: "Przeszukuje zweryfikowane materiały biblijne, audycje, artykuły CCN i lekcje Akademii. Nie wywołuje żadnych płatnych modeli generatywnych.",
        operationId: "searchKnowledge",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Szukana fraza, temat lub werset biblijny (np. 'Apokalipsa', 'J 3:16', 'wiara')",
            required: false,
            schema: { type: "string", maxLength: 256 }
          },
          {
            name: "lang",
            in: "query",
            description: "Kod języka (np. 'pl', 'en', 'de')",
            required: false,
            schema: { type: "string", default: "pl" }
          },
          {
            name: "type",
            in: "query",
            description: "Filtrowanie po typie materiału (scripture, course, article, audio, video, app)",
            required: false,
            schema: { type: "string" }
          },
          {
            name: "limit",
            in: "query",
            description: "Maksymalna liczba wyników (1-50)",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 }
          },
          {
            name: "cursor",
            in: "query",
            description: "Kursor do stronicowania wyników",
            required: false,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Wyniki wyszukiwania z cytowaniami",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string" },
                    total: { type: "integer" },
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          document_id: { type: "string" },
                          type: { type: "string" },
                          title: { type: "string" },
                          url: { type: "string", format: "uri" },
                          snippet: { type: "string" },
                          source_type: { type: "string" },
                          language: { type: "string" },
                          scripture_refs: { type: "array", items: { type: "string" } },
                          license: { type: "string" },
                          attribution: { type: "string" },
                          published_at: { type: "string", format: "date-time" },
                          last_verified_at: { type: "string", format: "date-time" }
                        }
                      }
                    },
                    next_cursor: { type: ["string", "null"] },
                    index_freshness: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/documents/{id}": {
      get: {
        summary: "Pobranie pojedynczego dokumentu",
        description: "Zwraca pełne kanoniczne metadane oraz licencjonowany tekst dokumentu według jego unikalnego identyfikatora.",
        operationId: "getDocument",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unikalny identyfikator dokumentu (np. cc:course:akademia)",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Dokument kanoniczny",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    document: { type: "object" }
                  }
                }
              }
            }
          },
          "404": {
            description: "Dokument nie istnieje lub został wycofany"
          }
        }
      }
    },
    "/topics": {
      get: {
        summary: "Katalog tematów wiedzy",
        description: "Zwraca listę kategorii i tematów wraz z liczbą powiązanych materiałów.",
        operationId: "getTopics",
        responses: {
          "200": {
            description: "Katalog tematów",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topics: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          count: { type: "integer" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
