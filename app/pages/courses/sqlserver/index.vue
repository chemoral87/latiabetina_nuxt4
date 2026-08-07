<template>
  <CoursesQuizQuizPage
    icon="mdi-database"
    title-en="SQL Server Quiz"
    subtitle-en="Test your SQL Server knowledge"
    title-es="SQL Server Quiz"
    subtitle-es="Pon a prueba tus conocimientos de SQL Server"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "SQL Server Quiz",
  icon: "mdi-database",
})

const questionsEn = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "en"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "en"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "en"),
]

const questionsEs = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "es"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "es"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "es"),
]
</script>
