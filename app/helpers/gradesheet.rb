class Gradesheet
  attr_reader :missing_grades
  attr_reader :assignment
  attr_reader :submissions
  attr_reader :graders
  attr_reader :raw_grades
  attr_reader :max_score
  attr_reader :grades
  def initialize(assignment, submissions)
    # A Grader specifies its relative weight compared to the other graders for that assignment

    # A Grade specifies a score and out_of, both of which are points.

    # Therefore, an assignment's grade is
    # Sum_{g in relevant grades} ((g.score / g.out_of) * g.grader.avail_score)
    # -------------------------------------------------------------------------
    # Sum_{g in relevant grades} g.grader.avail_score

    # If the score isn't ready yet, or if it's not released to students, then we show the blinded scores

    @assignment = assignment
    @submissions = submissions
    @graders = @assignment.assignment_graders.order(:order).includes(:grader).map{ |c| c.grader }
    @max_score = @graders.sum(&:avail_score)
    raw_grades = Grade.where(submission_id: @submissions.map(&:id))
    @raw_grades = raw_grades.group_by(&:submission_id)
    @missing_graders = (raw_grades.count < @graders.count * @submissions.count)

    @raw_score = 0
    @grades = {graders: @graders, grades: []}
    @submissions.each do |s|
      s_scores = {raw_score: 0.0, scores: []}
      b_scores = {raw_score: 0.0, scores: []}
      res = {sub: s, staff_scores: s_scores, blind_scores: b_scores}
      @graders.each do |c|
        g = if @raw_grades[s.id].nil? then nil else @raw_grades[s.id].find do |g| g.grader_id == c.id end end
        if g
          if g.out_of.nil?
            scaled = g.score
          else
            scaled = g.score.to_f * (c.avail_score.to_f / g.out_of.to_f)
          end
          if g.available
            s_scores[:raw_score] += scaled
            s_scores[:scores].push [scaled, c.avail_score]

            b_scores[:scores].push [scaled, c.avail_score]
            if b_scores[:raw_score] 
              b_scores[:raw_score] += scaled
            end
          else
            s_scores[:raw_score] += g.score.to_f
            s_scores[:scores].push [g.score, c.avail_score, "hidden"]
            b_scores[:raw_score] = nil
            b_scores[:scores].push "not ready"
          end
        else
          s_scores[:scores].push "Missing"
          b_scores[:scores].push "Missing"
        end
      end
      @grades[:grades].push res
    end
  end
end
