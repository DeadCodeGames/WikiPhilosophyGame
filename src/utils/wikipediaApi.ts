interface WikipediaParseResponse {
  title: string;
  section?: string;
  extract: string;
  nextLink: string | null;
  isRedirect: boolean;
  redirectTarget: string | undefined;
  redirectSection?: string | undefined;
}

export async function parseWikipediaArticle(
  title: string,
  languageCode: string = 'en'
): Promise<WikipediaParseResponse> {
  const API_BASE_URL = `https://${languageCode}.wikipedia.org/w/api.php`;
  
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    page: title,
    prop: 'text|links|sections',
    disabletoc: '1',
    mobileformat: '1',
    origin: '*'
  });

  const response = await fetch(`${API_BASE_URL}?${params}`);
  const data = await response.json();

  if (!data.parse) {
    throw new Error(`Failed to parse article: ${title}`);
  }

  const extract = stripHtml(data.parse.text['*']);
  const isRedirect = data.parse.text['*'].includes('class="redirectMsg"');
  let redirectTarget = null;

  if (isRedirect) {
    const redirectMatch = data.parse.text['*'].match(/<a href="\/wiki\/([^"]+)"/);
    if (redirectMatch) {
      redirectTarget = decodeURIComponent(redirectMatch[1]).replace(/_/g, ' ');
    }
  }

  // Get sections to skip - add language-specific section titles
  const sectionsToSkip : Set<number> = new Set(
    data.parse.sections
      .filter((section: any) => {
        const sectionTitle = section.line.toLowerCase();
        const skipPatterns = {
          sk: ['o iných významoch', 'iné projekty', 'pozri aj'],
          cz: ['další významy', 'externí odkazy', 'související články'],
          en: ['not to be confused with', 'disambiguation', 'other uses', 'see also'],
          jp: ['曖昧さ回避', '関連項目', 'その他の用法'],
          zh: ['消歧义', '相关条目', '其他用途'],
          ko: ['동음이의', '관련 항목', '다른 뜻'],
          fr: ['homonymie', 'voir aussi', 'autres utilisations'],
          de: ['begriffsklärung', 'siehe auch', 'weitere bedeutungen'],
          es: ['desambiguación', 'véase también', 'otros usos'],
          it: ['disambiguazione', 'vedi anche', 'altri usi'],
          ru: ['неоднозначность', 'см. также', 'другие значения'],
        };
        
        return skipPatterns[languageCode as keyof typeof skipPatterns]?.some(
          pattern => sectionTitle.includes(pattern)
        ) || false;
      })
      .map((section: any) => section.index)
  );

  // Parse HTML to find the first valid link
  const nextLink = isRedirect ? redirectTarget : findFirstValidLink(data.parse.text['*'], sectionsToSkip);

  return {
    title: data.parse.title.split("#")[0],
    section: data.parse.title.split("#")[1] || undefined,
    extract,
    nextLink,
    isRedirect,
    redirectTarget: redirectTarget?.split("#")[0],
    redirectSection: redirectTarget?.split("#")[1]
  };
}

// Rest of the utility functions remain the same
function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function removeParentheses(input: string): string {
  // Step 1: Handle <a href> attributes and temporarily replace them to avoid modification
  const hrefRegex = /<a\b[^>]*?href="[^"]*?"[^>]*?>/gi;
  const placeholders: string[] = [];
  const protectedInput = input.replace(hrefRegex, (match) => {
      placeholders.push(match);
      return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  // Step 2: Remove content inside parentheses (both half-width and full-width)
  // Repeatedly remove until no nested parentheses remain
  const removeParensRegex = /\([^()]*\)|（[^（）]*）/g;
  let result = protectedInput;
  let prevResult;
  do {
      prevResult = result;
      result = result.replace(removeParensRegex, "");
  } while (result !== prevResult);

  // Step 3: Restore <a href> attributes
  result = result.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[+index]);

  return result;
}


function findFirstValidLink(html: string, sectionsToSkip: Set<number>): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove elements with specified classes
  const classesToRemove = ['hatnote', 'navigation-not-searchable', 'ambox', 'box-Multiple_issues', 'metadata', 'mw-heading', 'side-box', 'pathnavbox', 'infobox', 'floatright'];
  const IDsToRemove = ['disambigbox', 'Vorlage_BK'];

  classesToRemove.forEach(className => {
    const elements = doc.getElementsByClassName(className);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
  });

  IDsToRemove.forEach(ID => {
    const element = doc.getElementById(ID);
    if (element) {
      element.remove();
    }
  })

  doc.querySelectorAll("[id^='infobox']").forEach(e=>e.remove())

  doc.querySelectorAll("style").forEach( style => style.remove() )

  // Find all paragraph elements
  const paragraphs = doc.querySelectorAll("div.mw-parser-output>*") || [];

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    
    // Skip if the paragraph is in a section we want to avoid
    if (paragraph.parentElement && sectionsToSkip.has(parseInt(paragraph.parentElement.id.split('-')[1]))) {
      continue;
    }

    // Remove content within parentheses, but preserve href attributes
    const textWithoutParentheses = removeParentheses(paragraph.innerHTML)

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textWithoutParentheses;

    // Find all links in the modified paragraph
    const links = tempDiv.getElementsByTagName('a');

    for (let j = 0; j < links.length; j++) {
      const link = links[j];
      const href = link.getAttribute('href');

      // Check if the link is valid
      if (href && href.startsWith('/wiki/') && 
          !href.includes(':') && 
          !href.includes('#') && 
          !link.classList.contains('new')) {
        return decodeURIComponent(href.split('/wiki/')[1]).replace(/_/g, ' ');
      }
    }
  }

  return null;
}

