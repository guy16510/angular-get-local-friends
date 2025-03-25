// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { LegalComponent } from './legal.component';

// describe('LegalComponent', () => {
//   let component: LegalComponent;
//   let fixture: ComponentFixture<LegalComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [LegalComponent], // Standalone component imported directly
//     }).compileComponents();

//     fixture = TestBed.createComponent(LegalComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create the LegalComponent', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should render legal header correctly', () => {
//     const compiled = fixture.nativeElement as HTMLElement;
//     expect(compiled.querySelector('h1')?.textContent).toContain('Legal Information');
//   });

//   it('should include contact email', () => {
//     const compiled = fixture.nativeElement as HTMLElement;
//     const emailLink = compiled.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
//     expect(emailLink).toBeTruthy();
//     expect(emailLink.href).toContain('mailto:legal@getlocalfriends.com');
//   });
// });