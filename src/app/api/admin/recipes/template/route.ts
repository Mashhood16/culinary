import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { verifyAdminSession } from '@/lib/admin-auth';

const templateHeaders = [
  'title',
  'slug',
  'cuisine',
  'country',
  'mealType',
  'foodType',
  'description',
  'history',
  'prepTime',
  'cookTime',
  'totalTime',
  'difficulty',
  'servings',
  'rating',
  'calories',
  'image',
  'tags',
  'ingredients',
  'steps',
  'alcoholFree',
  'containsAlcohol',
  'status',
  'sourceType',
  'licenseNote',
  'foodSafetyNote',
  'editorialNote',
  'historyStatus',
  'featured',
];

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Recipe Bulk Import Template'],
    ['Fill in the rows below and upload this file from the admin panel.'],
    [],
    templateHeaders,
    [
      'Chicken Biryani',
      'pakistani-chicken-biryani',
      'Pakistani',
      'Pakistan',
      'Dinner',
      'Rice Dish',
      'Original recipe draft',
      'Short history note',
      '25 min',
      '50 min',
      '75 min',
      'Medium',
      '4',
      '5',
      '480 kcal',
      'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=900&q=80',
      'pakistani, rice-dish',
      '2 cups long-grain rice; 600 g chicken',
      'Rinse rice; Cook onion; Add spices; Simmer; Layer rice; Rest and serve',
      'false',
      'false',
      'draft',
      'original_generated_draft',
      'Original draft content generated for this website.',
      'Verify allergens and food handling.',
      'Kitchen-test quantities before publication.',
      'needs_editorial_verification',
      'false',
    ],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bulk Recipes');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="recipe-bulk-import-template.xlsx"',
    },
  });
}
