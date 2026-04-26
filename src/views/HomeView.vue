<template>
  <div class="home">
    <!-- Intro -->
    <section class="intro">
      <img src="../assets/barryscoreboard.svg" alt="Logo" class="logo" />
      <h1>BarryScoreboard</h1>
      <p>
        A simple PWA app for managing tournament brackets and tracking match
        scores.
      </p>
    </section>

    <!-- Navigation cards -->
    <section class="cards">
      <router-link to="/bracket" class="card">
        <h2><Icon name="network" :size="18" class="rotate-90" />Bracket</h2>
        <p>Create, manage, save, and load tournament brackets.</p>
      </router-link>

      <router-link to="/scoreboard" class="card">
        <h2><Icon name="monitor" :size="18" />Scoreboard</h2>
        <p>View and update live match scores in real time.</p>
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Intro */
.intro {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 96px;
  height: 96px;
}

.intro p {
  opacity: 0.8;
  line-height: 1.5;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
</style>
