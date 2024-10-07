import { createClient } from '@supabase/supabase-js'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to handle Supabase errors
const handleError = (error: any) => {
  console.error('Database error:', error)
  throw new Error('An error occurred while performing the database operation.')
}

export async function uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('quiz-images')  // Replace with your actual bucket name
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
  
    if (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload image')
    }
  
    const { data: { publicUrl } } = supabase.storage
      .from('quiz-images')
      .getPublicUrl(path)
  
    return publicUrl
  }

export async function saveDocument(content: string, summary: string) {
  const { data, error } = await supabase
    .from('documents')
    .insert({ content, summary })
    .select()
    .single()

  if (error) handleError(error)
  return data.id
}
export async function saveQuiz({
    name,
    documentId,
    questions,
    numQuestions,
    requiredPassScore,
    limitTakers,
    takerLimit,
    startDate,
    endDate,
    coverImage,
    courseDistribution
  }: {
    name: string,
    documentId: number,
    questions: string,
    numQuestions: number,
    requiredPassScore: number,
    limitTakers: boolean,
    takerLimit: number | null,
    startDate: string,
    endDate: string,
    coverImage: File,
    courseDistribution: string
  }) {
    // Upload the cover image
    const imagePath = `quiz-covers/${Date.now()}-${coverImage.name}`
    const coverImageUrl = await uploadImage(coverImage, imagePath)
  
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        name,
        document_id: documentId,
        questions,
        num_questions: numQuestions,
        required_pass_score: requiredPassScore,
        limit_takers: limitTakers,
        taker_limit: takerLimit,
        start_date: startDate,
        end_date: endDate,
        cover_image_url: coverImageUrl,
        course_distribution: courseDistribution
      })
      .select()
      .single()
  
    if (error) handleError(error)
    return data.id
  }
  
  export async function getQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        rewards (
          id,
          reward_name,
          amount,
          distribution_type
        )
      `)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  
    return data.map(quiz => ({
      id: quiz.id,
      name: quiz.name || `Quest #${quiz.id}`,
      questions: quiz.questions,
      num_questions: quiz.num_questions,
      required_pass_score: quiz.required_pass_score,
      rewards: quiz.rewards.map(reward => ({
        reward_name: reward.reward_name,
        amount: reward.amount
      })),
      start_date: quiz.start_date,
      end_date: quiz.end_date,
      cover_image_url: quiz.cover_image_url,
      created_at: quiz.created_at,
      total_rewards: quiz.rewards.reduce((total, reward) => total + reward.amount, 0),
      reward_count: quiz.rewards.length
    }));
  }
export async function saveQuizAttempt(quizId: number, userAnswers: string, score: number) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id: quizId, user_answers: userAnswers, score })
    .select()
    .single()

  if (error) handleError(error)
  return data.id
}







export async function saveReward(
  quizId: number,
  rewardName: string,
  amount: number,
  distributionType: string
) {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      quiz_id: quizId,
      reward_name: rewardName,
      amount,
      distribution_type: distributionType
    })
    .select()
    .single()

  if (error) handleError(error)
  return data.id
}

export async function saveMultipleRewards(rewards: Array<{
  quizId: number,
  rewardName: string,
  amount: number,
  distributionType: string
}>) {
  const { data, error } = await supabase
    .from('rewards')
    .insert(rewards.map(reward => ({
      quiz_id: reward.quizId,
      reward_name: reward.rewardName,
      amount: reward.amount,
      distribution_type: reward.distributionType
    })))
    .select()

  if (error) handleError(error)
  return data.map(reward => reward.id)
}

export async function getRewardsByQuizId(quizId: number) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: true })

  if (error) handleError(error)
  return data
}

export async function updateReward(
  rewardId: number,
  updates: {
    rewardName?: string,
    amount?: number,
    distributionType?: string
  }
) {
  const { data, error } = await supabase
    .from('rewards')
    .update({
      reward_name: updates.rewardName,
      amount: updates.amount,
      distribution_type: updates.distributionType
    })
    .eq('id', rewardId)
    .select()
    .single()

  if (error) handleError(error)
  return data
}

export async function deleteReward(rewardId: number) {
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', rewardId)

  if (error) handleError(error)
}

export async function getTotalRewardsForQuiz(quizId: number) {
  const { data, error } = await supabase
    .from('rewards')
    .select('amount')
    .eq('quiz_id', quizId)

  if (error) handleError(error)
  return data.reduce((total, reward) => total + reward.amount, 0)
}

export async function getQuizById(id: number) {
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function getDocumentById(id: number) {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}