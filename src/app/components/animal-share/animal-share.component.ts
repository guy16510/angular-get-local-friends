import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animal-share',
  templateUrl: './animal-share.component.html',
  styleUrls: ['./animal-share.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class AnimalShareComponent implements OnInit {
  slug: string = '';
  animalName: string = '';
  gender: 'male' | 'female' = 'male'; // optional — hardcode or pass in
  description: string = '';
  imageUrl: string = '';

  constructor(private route: ActivatedRoute, private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || 'golden-retriever';

    // Ideally this comes from a static map or service
    const animalData = this.getAnimalProfile(this.slug);
    if (!animalData) return;

    this.animalName = animalData.name;
    this.gender = animalData.gender;
    this.description = animalData.description;
    this.imageUrl = `https://dev.getlocalfriends.com/assets/images/animal/${this.gender}/${this.slug}.png`;

    const pageTitle = `I'm a ${this.animalName} 🐾 – Discover Your Friendship Animal`;
    const pageDesc = this.description;
    const pageUrl = `https://dev.getlocalfriends.com/animal/${this.slug}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: this.imageUrl });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ property: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ property: 'twitter:image', content: this.imageUrl });
  }

  get facebookShareUrl(): string {
    const currentHost = window.location.hostname.includes('localhost')
      ? 'https://dev.getlocalfriends.com'
      : window.location.origin;
  
    const pageUrl = `${currentHost}/animal/${this.slug}`;
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  }
  
  getAnimalProfile(slug: string) {
    const profiles: Record<string, { name: string; description: string; gender: 'male' | 'female' }> = {
      'golden-retriever': {
        name: 'Loyal Golden Retriever',
        description: 'Friendly, dependable, and always down for a walk. Discover your friendship spirit animal too!',
        gender: 'male'
      },
      'cat': {
        name: 'Independent Cat',
        description: 'Mysterious, chill, and fiercely loyal to your inner circle.',
        gender: 'female'
      },
      // ... add more here
    };
    return profiles[slug];
  }
}
