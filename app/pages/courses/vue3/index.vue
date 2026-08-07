<template>
  <CoursesQuizQuizPage
    icon="mdi-vuejs"
    title-en="Vue 3 Quiz"
    subtitle-en="Test your Vue 3 knowledge"
    title-es="Vue 3 Quiz"
    subtitle-es="Pon a prueba tus conocimientos de Vue 3"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "Vue 3 Quiz",
  icon: "mdi-vuejs",
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
