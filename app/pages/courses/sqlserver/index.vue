<template>
  <CoursesQuizQuizPage
    icon="mdi-database"
    title-en="SQL Server Quiz"
    title-es="SQL Server Quiz"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
    subtitle-en="Test your SQL Server knowledge"
    subtitle-es="Pon a prueba tus conocimientos de SQL Server"
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
