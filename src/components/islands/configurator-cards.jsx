import {
  ExpandableCard,
  ExpandableCardBody,
  ExpandableCardContent,
  ExpandableCardDescription,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableCardMedia,
  ExpandableCardTitle,
  ExpandableCardTrigger,
} from '@/components/ui/expandable-card';
import { Button } from '@/components/ui/button';

function readExamples() {
  return Array.from(document.querySelectorAll('.configurator-work-static .configurator-example')).map((article) => {
    const img = article.querySelector('img');
    const title = article.querySelector('h3')?.textContent?.trim() ?? '';
    const lede = article.querySelector('.configurator-example__lede')?.textContent?.trim() ?? '';
    const body = Array.from(
      article.querySelectorAll('.configurator-example__change, .configurator-example__options'),
    )
      .map((paragraph) => paragraph.textContent.trim())
      .filter(Boolean);

    return {
      src: img?.getAttribute('src') ?? '',
      alt: img?.getAttribute('alt') ?? '',
      title,
      lede,
      body,
    };
  });
}

export default function ConfiguratorCards() {
  const examples = readExamples();

  if (!examples.length) return null;

  return (
    <div className="sh:grid sh:grid-cols-1 sh:gap-6 sh:sm:grid-cols-2 sh:lg:grid-cols-3">
      {examples.map((example) => (
        <ExpandableCard key={example.title}>
          <ExpandableCardTrigger className="sh:flex sh:h-full sh:max-w-none sh:flex-col">
            <ExpandableCardMedia className="sh:block sh:aspect-[3/2] sh:w-full">
              <img
                src={example.src}
                alt={example.alt}
                width="1600"
                height="1066"
                className="sh:aspect-[3/2] sh:h-full sh:w-full sh:object-cover"
              />
            </ExpandableCardMedia>
            <span className="sh:flex sh:flex-1 sh:flex-col sh:gap-2 sh:p-5">
              <span className="sh:text-lg sh:font-semibold sh:tracking-tight sh:text-foreground">
                {example.title}
              </span>
              <span className="sh:text-sm sh:leading-6 sh:text-muted-foreground">{example.lede}</span>
            </span>
          </ExpandableCardTrigger>
          <ExpandableCardContent showCloseButton closeLabel="Close">
            <ExpandableCardMedia className="sh:block sh:aspect-[3/2] sh:w-full">
              <img
                src={example.src}
                alt={example.alt}
                width="1600"
                height="1066"
                className="sh:aspect-[3/2] sh:h-full sh:w-full sh:object-cover"
              />
            </ExpandableCardMedia>
            <ExpandableCardHeader>
              <ExpandableCardTitle>{example.title}</ExpandableCardTitle>
              <ExpandableCardDescription>{example.lede}</ExpandableCardDescription>
            </ExpandableCardHeader>
            <ExpandableCardBody className="sh:flex sh:flex-col sh:gap-4 sh:text-sm sh:leading-6 sh:text-muted-foreground">
              {example.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </ExpandableCardBody>
            <ExpandableCardFooter>
              <Button asChild>
                <a href="/contact.html">Start a Project</a>
              </Button>
            </ExpandableCardFooter>
          </ExpandableCardContent>
        </ExpandableCard>
      ))}
    </div>
  );
}
