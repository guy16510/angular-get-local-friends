import { Component, OnInit } from '@angular/core';
import { SURVEY_QUESTIONS, SurveyQuestion, QuestionType } from '../../data/surveyQuestions'; // adjust path as needed
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { ChartD3Component } from '../shared/chart/chart-d3.component';


/**
 * This page will take more shape once there are users in the system.
 * For now, leave this as a demo page.
 * The future will compare/contrast users in area's demographics
 * - Some of these will be free, others will be Premium
 * For now maybe share a chart or 2 and have it greyed out and say "Premium Only"
 */






interface SurveyAnswer {
  answer: any;
  questionId: number;
}

interface UserProfile {
  surveyAnswers: SurveyAnswer[];
  // other fields as needed...
}

interface QuestionInsight {
  question: string;
  questionIcon: string; // icon determined by question content
  typeIcon: string;     // icon based on question type (e.g. radio, sliding scale)
  progress?: number;    // 0-100 progress for ordered answers
  answer?: string | string[] | number;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [MaterialModule, CommonModule, ChartD3Component]
})

export class DashboardComponent implements OnInit {
  userProfile!: UserProfile;
  surveyAnswers!: SurveyAnswer[];
  questionInsights: QuestionInsight[] = [];

  // Composite overall profile chart:
  compositeChartLabels: string[] = [
    'Friendship Preferences',
    'Interests & Activities',
    'Social Energy',
    'Communication',
    'Physical Activity',
    'Personal Preferences'
  ];
  compositeChartData: number[] = [];

  constructor() {}

  ngOnInit(): void {
    // Simulated single API response (survey questions stored locally)
    const apiResponse: any = {
      data: {
        fetchUserProfile: "{\"lastUpdated\":\"2025-03-04T15:36:00.469Z\",\"locationLng\":-71.4543323,\"locationLat\":42.6383562,\"geoPrecision\":7,\"rangeKey\":\"drt4w40#us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6\",\"updatedAt\":\"2025-03-04T15:36:00.469Z\",\"geohash\":\"drt4w40\",\"createdAt\":\"2025-03-04T15:36:00.469Z\",\"identityId\":\"us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6c\",\"surveyAnswers\":[{\"answer\":\"35-44\",\"questionId\":1},{\"answer\":\"25-34\",\"questionId\":2},{\"answer\":\"35-44\",\"questionId\":2},{\"answer\":\"45-54\",\"questionId\":2},{\"answer\":\"Male\",\"questionId\":3},{\"answer\":\"No preference\",\"questionId\":4},{\"answer\":\"Yes\",\"questionId\":5},{\"answer\":\"Yes\",\"questionId\":6},{\"answer\":\"Toddler (2-4)\",\"questionId\":7},{\"answer\":\"true\",\"questionId\":8},{\"answer\":\"Somewhat important\",\"questionId\":9},{\"answer\":\"No preference\",\"questionId\":10},{\"answer\":\"Once a week\",\"questionId\":11},{\"answer\":\"Looking for more social connections\",\"questionId\":12},{\"answer\":\"Only local\",\"questionId\":13},{\"answer\":\"Casual hangouts\",\"questionId\":14},{\"answer\":\"Outdoor activities\",\"questionId\":14},{\"answer\":\"Game nights\",\"questionId\":14},{\"answer\":\"Travel buddies\",\"questionId\":14},{\"answer\":\"10-20 miles\",\"questionId\":15},{\"answer\":\"Outdoors (hiking, camping, fishing, biking)\",\"questionId\":16},{\"answer\":\"Socializing (bars, game nights, clubbing)\",\"questionId\":16},{\"answer\":\"Creative hobbies (art, writing, music, crafts)\",\"questionId\":16},{\"answer\":\"Traveling and exploring new places\",\"questionId\":16},{\"answer\":\"Fitness (gym, yoga, running, sports)\",\"questionId\":16},{\"answer\":\"Casual coffee meetups\",\"questionId\":17},{\"answer\":\"Outdoor adventures\",\"questionId\":17},{\"answer\":\"Family-friendly gatherings\",\"questionId\":17},{\"answer\":\"Staying home and relaxing\",\"questionId\":18},{\"answer\":\"true\",\"questionId\":19},{\"answer\":\"Spontaneous plans\",\"questionId\":20},{\"answer\":\"Through shared activities\",\"questionId\":21},{\"answer\":\"Active\",\"questionId\":22},{\"answer\":\"false\",\"questionId\":23},{\"answer\":\"Outdoor\",\"questionId\":24},{\"answer\":\"Enjoy them occasionally.\",\"questionId\":25},{\"answer\":\"After a couple of interactions\",\"questionId\":26},{\"answer\":\"Weekly\",\"questionId\":27},{\"answer\":\"true\",\"questionId\":28},{\"answer\":\"Small group (2-3 other people)\",\"questionId\":29},{\"answer\":\"Spending time alone\",\"questionId\":30},{\"answer\":\"Hosting\",\"questionId\":31},{\"answer\":\"Being invited\",\"questionId\":31},{\"answer\":4,\"questionId\":32},{\"answer\":\"Yes, I make the first move\",\"questionId\":33},{\"answer\":\"Casual, lighthearted\",\"questionId\":34},{\"answer\":\"Text\",\"questionId\":35},{\"answer\":\"Monthly\",\"questionId\":36},{\"answer\":\"true\",\"questionId\":37},{\"answer\":\"Listener\",\"questionId\":38},{\"answer\":\"Last-minute planning\",\"questionId\":39},{\"answer\":\"$51-$100\",\"questionId\":40},{\"answer\":\"Casual dining\",\"questionId\":41},{\"answer\":\"true\",\"questionId\":42},{\"answer\":\"true\",\"questionId\":43},{\"answer\":\"true\",\"questionId\":44},{\"answer\":\"Love them\",\"questionId\":45},{\"answer\":\"true\",\"questionId\":47},{\"answer\":\"Technology\",\"questionId\":48},{\"answer\":\"Comfortable\",\"questionId\":49},{\"answer\":\"true\",\"questionId\":50},{\"answer\":\"9-5\",\"questionId\":51},{\"answer\":\"Not at all\",\"questionId\":52},{\"answer\":\"true\",\"questionId\":53},{\"answer\":\"true\",\"questionId\":54},{\"answer\":\"No issue\",\"questionId\":55},{\"answer\":\"Yes\",\"questionId\":56},{\"answer\":\"Action\",\"questionId\":57},{\"answer\":\"Comedy\",\"questionId\":57},{\"answer\":\"Sci-fi\",\"questionId\":57},{\"answer\":\"Drama\",\"questionId\":57},{\"answer\":\"Horror\",\"questionId\":57},{\"answer\":\"Watching 1-2 episodes at a time\",\"questionId\":58},{\"answer\":\"true\",\"questionId\":59},{\"answer\":\"Pop\",\"questionId\":60},{\"answer\":\"Rock\",\"questionId\":60},{\"answer\":\"Electronic\",\"questionId\":60},{\"answer\":\"Country\",\"questionId\":60},{\"answer\":\"false\",\"questionId\":61},{\"answer\":\"Maybe\",\"questionId\":62},{\"answer\":\"true\",\"questionId\":63},{\"answer\":\"Cozy pub\",\"questionId\":64},{\"answer\":\"Comfortable\",\"questionId\":65},{\"answer\":\"false\",\"questionId\":66},{\"answer\":\"Yes\",\"questionId\":67},{\"answer\":\"Yes\",\"questionId\":68},{\"answer\":\"Somewhat active\",\"questionId\":69},{\"answer\":\"Running\",\"questionId\":70},{\"answer\":\"Gym workouts\",\"questionId\":70},{\"answer\":\"true\",\"questionId\":71},{\"answer\":\"Alone\",\"questionId\":72},{\"answer\":\"true\",\"questionId\":73},{\"answer\":\"true\",\"questionId\":74},{\"answer\":\"Not at all\",\"questionId\":75},{\"answer\":\"No\",\"questionId\":76},{\"answer\":\"Dog(s)\",\"questionId\":77},{\"answer\":\"Not Important\",\"questionId\":78},{\"answer\":\"Liberal\",\"questionId\":79},{\"answer\":\"Somewhat Important\",\"questionId\":80},{\"answer\":\"false\",\"questionId\":81},{\"answer\":\"Concerned\",\"questionId\":82},{\"answer\":\"Occasionally\",\"questionId\":83},{\"answer\":\"true\",\"questionId\":84},{\"answer\":\"true\",\"questionId\":85},{\"answer\":\"Somewhat Important\",\"questionId\":86},{\"answer\":\"true\",\"questionId\":87},{\"answer\":\"Open\",\"questionId\":88},{\"answer\":\"No preference\",\"questionId\":89},{\"answer\":\"Not Important\",\"questionId\":90}]}"
      }
    };

    this.userProfile = JSON.parse(apiResponse.data.fetchUserProfile);
    this.surveyAnswers = this.userProfile.surveyAnswers;
    this.buildQuestionInsights();

    // Compute composite indices for each category.
    const friendshipIndex = this.computeFriendshipPreferencesIndex();
    const interestsIndex  = this.computeInterestsAndActivitiesIndex();
    const socialEnergyIndex = this.computeSocialEnergyIndex();
    const communicationIndex = this.computeCommunicationStyleIndex();
    const physicalActivityIndex = this.computePhysicalActivityIndex();
    const personalPreferencesIndex = this.computePersonalPreferencesIndex();

    // Set composite chart data (all scaled 1-5)
    this.compositeChartData = [
      friendshipIndex,
      interestsIndex,
      socialEnergyIndex,
      communicationIndex,
      physicalActivityIndex,
      personalPreferencesIndex
    ];
  }

  // --- Composite Index Computations ---

  // Friendship Preferences composite: Using Q10, Q11, Q13, Q15
  private computeFriendshipPreferencesIndex(): number {
    const mapQ10 = (ans: string): number => {
      if (ans === "Only parents") return 5;
      if (ans === "Only non-parents") return 1;
      if (ans === "No preference") return 3;
      return 0;
    };
    const mapQ11 = (ans: string): number => {
      if (ans === "Multiple times a week") return 5;
      if (ans === "Once a week") return 4;
      if (ans === "A few times a month") return 2;
      if (ans === "Rarely") return 1;
      return 0;
    };
    const mapQ13 = (ans: string): number => {
      if (ans === "Only local") return 5;
      if (ans === "Open to both") return 3;
      if (ans === "Only online friendships") return 1;
      return 0;
    };
    const mapQ15 = (ans: string): number => {
      if (ans === "Within 5 miles") return 5;
      if (ans === "10-20 miles") return 3;
      if (ans === "More than 20 miles") return 1;
      if (ans === "Depends on the event") return 3;
      return 0;
    };

    let total = 0, count = 0;
    const a10 = this.surveyAnswers.find(a => a.questionId === 10)?.answer;
    const a11 = this.surveyAnswers.find(a => a.questionId === 11)?.answer;
    const a13 = this.surveyAnswers.find(a => a.questionId === 13)?.answer;
    const a15 = this.surveyAnswers.find(a => a.questionId === 15)?.answer;
    if (a10) { total += mapQ10(a10); count++; }
    if (a11) { total += mapQ11(a11); count++; }
    if (a13) { total += mapQ13(a13); count++; }
    if (a15) { total += mapQ15(a15); count++; }
    return count > 0 ? total / count : 0;
  }

  // Interests & Activities composite: Using Q16, Q18, Q22, Q23
  private computeInterestsAndActivitiesIndex(): number {
    // Q16 is multiple-select: count the number of interests selected (normalize: 1 selection -> 1, 5+ -> 5)
    const a16 = this.surveyAnswers.filter(a => a.questionId === 16).map(a => a.answer);
    const count16 = a16.length;
    const score16 = Math.min(count16, 5); // cap at 5

    const mapQ18 = (ans: string): number => {
      if (ans === "Exploring a new city") return 5;
      if (ans === "Staying home and relaxing") return 1;
      if (ans === "Doing an outdoor activity") return 4;
      if (ans === "Hosting or attending a party") return 3;
      return 0;
    };
    const mapQ22 = (ans: string): number => {
      if (ans === "Active") return 5;
      if (ans === "Relaxed") return 1;
      return 0;
    };
    const mapQ23 = (ans: string): number => (ans === "true" ? 5 : 1);

    let total = 0, count = 0;
    const a18 = this.surveyAnswers.find(a => a.questionId === 18)?.answer;
    const a22 = this.surveyAnswers.find(a => a.questionId === 22)?.answer;
    const a23 = this.surveyAnswers.find(a => a.questionId === 23)?.answer;
    if (score16) { total += score16; count++; }
    if (a18) { total += mapQ18(a18); count++; }
    if (a22) { total += mapQ22(a22); count++; }
    if (a23) { total += mapQ23(a23); count++; }
    return count > 0 ? total / count : 0;
  }

  // Social Energy composite: Using Q25, Q26, Q27, Q30, Q32
  private computeSocialEnergyIndex(): number {
    const mapQ25 = (ans: string): number => {
      if (ans === "Love them! The more, the merrier.") return 5;
      if (ans === "Enjoy them occasionally.") return 4;
      if (ans === "Prefer small groups or one-on-one.") return 2;
      if (ans === "Avoid them at all costs.") return 1;
      return 0;
    };
    const mapQ26 = (ans: string): number => {
      if (ans === "Instantly") return 5;
      if (ans === "After a couple of interactions") return 3;
      if (ans === "Takes me a while") return 1;
      return 0;
    };
    const mapQ27 = (ans: string): number => {
      if (ans === "Daily") return 5;
      if (ans === "Weekly") return 4;
      if (ans === "A couple of times a month") return 2;
      if (ans === "Rarely, but I like staying in touch online") return 1;
      return 0;
    };
    const mapQ30 = (ans: string): number => {
      if (ans === "Spending time alone") return 1;
      if (ans === "Hanging out with a small, close-knit group") return 3;
      if (ans === "More socializing!") return 5;
      return 0;
    };

    let total = 0, count = 0;
    const a25 = this.surveyAnswers.find(a => a.questionId === 25)?.answer;
    const a26 = this.surveyAnswers.find(a => a.questionId === 26)?.answer;
    const a27 = this.surveyAnswers.find(a => a.questionId === 27)?.answer;
    const a30 = this.surveyAnswers.find(a => a.questionId === 30)?.answer;
    const a32 = this.surveyAnswers.find(a => a.questionId === 32)?.answer;
    if (a25) { total += mapQ25(a25); count++; }
    if (a26) { total += mapQ26(a26); count++; }
    if (a27) { total += mapQ27(a27); count++; }
    if (a30) { total += mapQ30(a30); count++; }
    if (a32) { total += Number(a32); count++; }
    return count > 0 ? total / count : 0;
  }

  // Communication Style composite: Using Q36, Q37, Q38
  private computeCommunicationStyleIndex(): number {
    const mapQ36 = (ans: string): number => {
      if (ans === "Daily") return 5;
      if (ans === "Weekly") return 4;
      if (ans === "Monthly") return 2;
      if (ans === "Rarely") return 1;
      return 0;
    };
    const mapQ37 = (ans: string): number => (ans === "true" ? 5 : 1);
    const mapQ38 = (ans: string): number => {
      if (ans === "Talker") return 5;
      if (ans === "Listener") return 2;
      return 0;
    };

    let total = 0, count = 0;
    const a36 = this.surveyAnswers.find(a => a.questionId === 36)?.answer;
    const a37 = this.surveyAnswers.find(a => a.questionId === 37)?.answer;
    const a38 = this.surveyAnswers.find(a => a.questionId === 38)?.answer;
    if (a36) { total += mapQ36(a36); count++; }
    if (a37) { total += mapQ37(a37); count++; }
    if (a38) { total += mapQ38(a38); count++; }
    return count > 0 ? total / count : 0;
  }

  // Physical Activity & Fitness composite: Using Q69, Q70, Q71, Q72, Q73, Q74, Q75
  private computePhysicalActivityIndex(): number {
    const mapQ69 = (ans: string): number => {
      if (ans === "Not active") return 1;
      if (ans === "Somewhat active") return 3;
      if (ans === "Very active") return 5;
      return 0;
    };
    // Q70 is multiple-select: count selections (normalize to 1-5)
    const a70 = this.surveyAnswers.filter(a => a.questionId === 70).map(a => a.answer);
    const score70 = Math.min(a70.length, 5);
    const mapQ71 = (ans: string): number => (ans === "true" ? 5 : 1);
    const mapQ72 = (ans: string): number => (ans === "With others" ? 5 : ans === "Alone" ? 1 : 0);
    const mapQ73 = (ans: string): number => (ans === "true" ? 5 : 1);
    const mapQ74 = (ans: string): number => (ans === "true" ? 5 : 1);
    const mapQ75 = (ans: string): number => {
      if (ans === "Not at all") return 1;
      if (ans === "Somewhat") return 3;
      if (ans === "Significantly") return 5;
      return 0;
    };

    let total = 0, count = 0;
    const a69 = this.surveyAnswers.find(a => a.questionId === 69)?.answer;
    const a71 = this.surveyAnswers.find(a => a.questionId === 71)?.answer;
    const a72 = this.surveyAnswers.find(a => a.questionId === 72)?.answer;
    const a73 = this.surveyAnswers.find(a => a.questionId === 73)?.answer;
    const a74 = this.surveyAnswers.find(a => a.questionId === 74)?.answer;
    const a75 = this.surveyAnswers.find(a => a.questionId === 75)?.answer;
    if (a69) { total += mapQ69(a69); count++; }
    total += score70; count++;
    if (a71) { total += mapQ71(a71); count++; }
    if (a72) { total += mapQ72(a72); count++; }
    if (a73) { total += mapQ73(a73); count++; }
    if (a74) { total += mapQ74(a74); count++; }
    if (a75) { total += mapQ75(a75); count++; }
    return count > 0 ? total / count : 0;
  }

  // Personal Preferences & Dealbreakers composite: Using Q80, Q86, Q88, Q89
  private computePersonalPreferencesIndex(): number {
    const mapQ80 = (ans: string): number => {
      if (ans === "Important") return 5;
      if (ans === "Somewhat Important") return 3;
      if (ans === "Not Important") return 1;
      return 0;
    };
    const mapQ86 = (ans: string): number => {
      if (ans === "Important") return 5;
      if (ans === "Somewhat Important") return 3;
      if (ans === "Not Important") return 1;
      return 0;
    };
    const mapQ88 = (ans: string): number => {
      const lower = ans.toLowerCase();
      if (lower === "open") return 5;
      if (lower === "reserved") return 2;
      if (lower.includes("depends")) return 3;
      return 0;
    };
    const mapQ89 = (ans: string): number => {
      if (ans === "Extroverted") return 5;
      if (ans === "Introverted") return 1;
      if (ans === "No preference") return 3;
      return 0;
    };

    let total = 0, count = 0;
    const a80 = this.surveyAnswers.find(a => a.questionId === 80)?.answer;
    const a86 = this.surveyAnswers.find(a => a.questionId === 86)?.answer;
    const a88 = this.surveyAnswers.find(a => a.questionId === 88)?.answer;
    const a89 = this.surveyAnswers.find(a => a.questionId === 89)?.answer;
    if (a80) { total += mapQ80(a80); count++; }
    if (a86) { total += mapQ86(a86); count++; }
    if (a88) { total += mapQ88(a88); count++; }
    if (a89) { total += mapQ89(a89); count++; }
    return count > 0 ? total / count : 0;
  }

  private buildQuestionInsights(): void {
    this.questionInsights = SURVEY_QUESTIONS.map((q: SurveyQuestion) => {
      const answerObj = this.surveyAnswers.find(a => a.questionId === q.id);
      const answer = answerObj ? answerObj.answer : null;
      const questionIcon = this.getQuestionIcon(q);
      const typeIcon = this.getTypeIcon(q.type);
      let progress: number | undefined;

      // For radio button or true-false questions with ordered options:
      if ((q.type === 'multiple-choice' || q.type === 'true-false') && q.options && answer) {
        const index = q.options.indexOf(answer);
        if (index !== -1 && q.options.length > 1) {
          progress = (index / (q.options.length - 1)) * 100;
        }
      }
      // For sliding-scale questions:
      if (q.type === 'sliding-scale' && q.scale && answer) {
        progress = ((Number(answer) - q.scale.min) / (q.scale.max - q.scale.min)) * 100;
      }

      return {
        question: q.question,
        questionIcon,
        typeIcon,
        progress,
        answer
      } as QuestionInsight;
    });
  }

  private getQuestionIcon(q: SurveyQuestion): string {
    // Use heuristics based on question text:
    const txt = q.question.toLowerCase();
    if (txt.includes('age')) return 'cake';
    if (txt.includes('gender')) return 'wc';
    if (txt.includes('kid')) return 'child_friendly';
    if (txt.includes('friend')) return 'group';
    if (txt.includes('social')) return 'people';
    if (txt.includes('energy')) return 'flash_on';
    if (txt.includes('communication')) return 'chat';
    if (txt.includes('money')) return 'attach_money';
    if (txt.includes('work')) return 'work';
    if (txt.includes('event') || txt.includes('meet')) return 'event';
    if (txt.includes('interest')) return 'local_activity';
    if (txt.includes('entertain')) return 'theaters';
    if (txt.includes('lifestyle')) return 'emoji_food_beverage';
    if (txt.includes('fitness')) return 'fitness_center';
    if (txt.includes('preference') || txt.includes('dealbreaker')) return 'tune';
    return 'help_outline';
  }

  private getTypeIcon(type: QuestionType): string {
    switch(type) {
      case 'multiple-choice': return 'radio_button_checked';
      case 'multiple-select': return 'check_box';
      case 'true-false': return 'toggle_on';
      case 'fill-in': return 'edit';
      case 'sliding-scale': return 'linear_scale';
      default: return 'help_outline';
    }
  }
}