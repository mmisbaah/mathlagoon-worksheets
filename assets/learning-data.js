(function(root){
  const E=(title,steps,hint)=>({title,steps,hint});
  root.WorksheetLearning={
    levels:[
      'Foundation skills: counting, joining, taking away, letters and pictures.',
      'Building skills: two-digit numbers, word recognition and spatial practice.',
      'Growing skills: larger numbers, tables to 10 and vocabulary.',
      'Stretching skills: decimals, metric units, rectangles and word meaning.',
      'Extension skills: percentages, negative numbers, circle measures and advanced vocabulary.'
    ],
    examples:{
      '1-letters':E('C is for coconut',['Say coconut slowly. Listen to its first sound.','Look at C. Trace the curve, then write C yourself.'],'Say the word before writing the letter.'),
      '1-numbers':E('Count four shells',['Touch each shell once: 1, 2, 3, 4.','The last number tells how many. Write 4.'],'Move each object aside after counting it.'),
      '1-shapes':E('Find a triangle on an island flag',['Follow the edge of the triangle. Count 3 straight sides.','Count its 3 corners. Turning it does not change its shape.'],'Look at the sides, not the colour.'),
      '1-tracing':E('Follow the wave',['Start at the left end.','Move slowly along the line to the right.'],'Use your finger first, then a pencil on paper.'),
      '1-matching':E('Find two matching fish',['Turn over one tile. Remember its picture.','Turn over another. A pair has the same picture.'],'Remember where you saw each picture.'),
      '1-patterns':E('Shell, fish, shell, fish …',['Find the part that repeats: shell, fish.','After the fish comes a shell again.'],'Say the repeating part aloud.'),
      '1-flashcards':E('Look, say, check',['Look at the front and say your answer.','Flip the card to check. Try again later if needed.'],'Try remembering before you flip.'),
      '2-letters':E('Read the word ship',['Say sh together as one sound. Then say i and p.','Blend the sounds: ship. Find the same letters in order.'],'Read across or down in the word search.'),
      '2-numbers':E('Count shells in pairs',['Start at 2. Add 2 each time: 2, 4, 6, 8.','The next number is 10.'],'Find how much is added each time.'),
      '2-shapes':E('A beach ball is like a sphere',['A sphere is a solid shape. Its surface is curved.','Turn a ball around. It has no flat faces or corners.'],'Compare a ball with a box.'),
      '2-dottodot':E('Join the boat dots',['Find the first number. Draw to the next number.','Keep following the number order, without skipping dots.'],'Check the selected counting step.'),
      '2-mazes':E('Find a path to the beach',['Start at the entrance. Follow an open path.','If a wall blocks you, return to the last junction.'],'Do not cross a wall.'),
      '3-letters':E('What does protect mean?',['We protect a reef by keeping it safe.','Use the meaning as a clue to the missing word.'],'Read the clue before choosing letters.'),
      '3-numbers':E('Three rows of four fish',['Each row has 4 fish. Count 4, 8, 12.','The grid entry for 3 × 4 is 12.'],'For sequences, check the change between each pair.'),
      '3-shapes':E('A pentagon has five sides',['Trace its outside edge and count 5 straight sides.','Count 5 vertices. A vertex is a corner.'],'Count only the outside edges.'),
      '3-gk':E('Think about living things',['A fish uses gills to breathe in water.','Read all choices and choose the one that matches the fact.'],'Rule out choices you know are not correct.'),
      '3-bodyparts':E('Find the elbow',['Bend your arm. Notice the joint in the middle.','That joint is your elbow. Follow the diagram line carefully.'],'Look where the pointer ends.'),
      '4-letters':E('Find a synonym for calm',['A synonym has a similar meaning.','A calm lagoon is peaceful. Calm and peaceful are synonyms.'],'Try the word in the sentence.'),
      '4-numbers':E('Fractions and rounding',['If 2 of 4 equal parts are shaded, the fraction is 2/4.','To round 47 to the nearest ten, compare 40 and 50. It is closer to 50.'],'Check which mode you selected before answering.'),
      '4-shapes':E('A rectangular garden is 6 m by 4 m',['Area counts the surface: 6 × 4 = 24 square metres.','Perimeter follows the edge: 6 + 4 + 6 + 4 = 20 metres.'],'Area uses square units; perimeter uses length units.'),
      '4-grammar':E('The turtle swims.',['Turtle names an animal: it is a noun.','Swims tells what it does: it is a verb.'],'Find the naming word or the action word.'),
      '4-measurement':E('Convert 2 metres to centimetres',['One metre is 100 centimetres.','Two metres is 2 × 100 = 200 centimetres.'],'Write the unit beside your answer.'),
      '5-letters':E('Use clues in the sentence',['The lagoon was tranquil; not a wave disturbed the water.','The second part suggests tranquil means calm and peaceful.'],'Look for words that explain or contrast the unknown word.'),
      '5-numbers':E('Write one quarter as a decimal and percent',['Divide 1 by 4 to get 0.25.','Multiply 0.25 by 100 to get 25%.'],'For simplification, divide the top and bottom by the same factor.'),
      '5-shapes':E('Choose the correct shape rule',['Rectangle area: length × width. Right triangle area: base × perpendicular height ÷ 2.','Circle area: 3.14 × radius × radius. Circumference: 2 × 3.14 × radius. Round circle answers to 1 decimal place.'],'Use all labelled sides for perimeter. Circle measures are extension work.'),
      '5-gk':E('Read a science question carefully',['A plant uses sunlight to help make food.','Choose the answer that explains the question, not just a familiar word.'],'This is optional general-knowledge enrichment, not a maths grade test.'),
      '5-logic':E('Complete the mini number grid',['Each row, column and small box needs 1, 2, 3 and 4 once each.','If a row has 1, 2 and 4, its missing number is 3. Check the column too.'],'Use the numbers already given; do not guess first.')
    },
    levelArithmetic:{
      '2-add':E('Join 24 shells and 13 shells',['Add the tens: 20 + 10 = 30.','Add the ones: 4 + 3 = 7. Join 30 and 7 to get 37.'],'Split each number into tens and ones.'),
      '2-sub':E('Take 12 from 35 coconuts',['Take away 10 first: 35 − 10 = 25.','Take away 2 more: 25 − 2 = 23.'],'Take away the tens, then the ones.'),
      '3-add':E('Add 248 and 137',['Add the hundreds: 200 + 100 = 300.','Add tens and ones: 40 + 30 = 70; 8 + 7 = 15.','Join the parts: 300 + 70 + 15 = 385.'],'Add each place value, then combine the parts.'),
      '3-sub':E('Subtract 126 from 354',['354 − 100 = 254.','254 − 20 = 234. Then 234 − 6 = 228.'],'Subtract one place value at a time.'),
      '3-div':E('Share 24 shells among 6 children',['Each child gets the same number of shells.','6 groups of 4 make 24, so 24 ÷ 6 = 4.'],'Use a multiplication fact to check.'),
      '4-add':E('Add 12.4 and 3.7',['Add whole parts: 12 + 3 = 15.','Add tenths: 0.4 + 0.7 = 1.1.','15 + 1.1 = 16.1.'],'Keep tenths lined up with tenths.'),
      '4-sub':E('Subtract 2.6 from 8.3',['Take away 2: 8.3 − 2 = 6.3.','Take away 0.3 to reach 6.0, then 0.3 more to reach 5.7.'],'Check with addition: 5.7 + 2.6 = 8.3.'),
      '4-mul':E('Find 24 × 13',['Split 13 into 10 and 3.','24 × 10 = 240; 24 × 3 = 72.','Add 240 + 72 = 312.'],'Multiply by each part, then add.'),
      '4-div':E('Share 137 shells in groups of 4',['4 × 30 = 120, leaving 17.','4 × 4 = 16, leaving 1.','137 ÷ 4 = 34 remainder 1.'],'Check: 34 × 4 + 1 = 137.'),
      '5-mul':E('Find 123 × 24',['123 × 20 = 2460.','123 × 4 = 492.','2460 + 492 = 2952.'],'Split the second number into tens and ones.'),
      '5-div':E('Divide 487 by 12',['12 × 40 = 480.','487 − 480 = 7.','The answer is 40 remainder 7.'],'The remainder must be less than 12.')
    },
    arithmetic:{
      add:E('Join two groups of shells',['Put 3 shells beside 2 more shells.','Count them together: 3 + 2 = 5.'],'Start with one amount and count on.'),
      sub:E('Take away some coconuts',['There are 7 coconuts. Take away 3.','There are 4 left: 7 − 3 = 4.'],'Count back or check with addition.'),
      mul:E('Count equal groups of fish',['There are 3 groups with 4 fish in each.','4 + 4 + 4 = 12, so 3 × 4 = 12.'],'Each group must have the same number.'),
      div:E('Share shells into groups',['Share 17 shells into groups of 5. Make 3 full groups.','2 shells remain: 17 = 3 × 5 + 2.'],'The remainder must be smaller than the group size.'),
      order:E('Choose the operation order',['In 2 + 3 × 4, multiply first: 3 × 4 = 12. Then add 2 to get 14.','In (2 + 3) × 4, do the brackets first: 5 × 4 = 20.'],'Brackets first, then multiply or divide, then add or subtract.'),
      percent:E('Find 25% of 80 shells',['25% is one quarter.','80 ÷ 4 = 20 shells.'],'Find 1% first if a familiar fraction does not help.'),
      negative:E('Read a number line',['Start at −3. Move 5 places right to add 5.','You reach 2, so −3 + 5 = 2.'],'Adding a positive number moves right; subtracting it moves left.')
    }
  };
})(window);
