<template>
  <CoursesQuizQuizPage
    icon="mdi-atom"
    title-en="React 16 Quiz"
    subtitle-en="Test your React 16 knowledge"
    title-es="React 16 Quiz"
    subtitle-es="Pon a prueba tus conocimientos de React 16"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "React 16 Quiz",
  icon: "mdi-atom",
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
