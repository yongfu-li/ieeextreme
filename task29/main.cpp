#include <algorithm>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

using namespace std;

struct State {
    int matches = -1;
    int swaps = numeric_limits<int>::max();
};

static void relax(State& target, const int cand_matches, const int cand_swaps) {
    if (cand_matches > target.matches) {
        target.matches = cand_matches;
        target.swaps = cand_swaps;
        return;
    }
    if (cand_matches == target.matches && cand_swaps < target.swaps) {
        target.swaps = cand_swaps;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string text;
    string pattern;
    cin >> text >> pattern;

    const int n = static_cast<int>(text.size());
    const int m = static_cast<int>(pattern.size());

    vector<int> prefix_zero(n + 1, 0);
    vector<int> prefix_one(n + 1, 0);
    vector<int> zero_positions;
    vector<int> one_positions;
    zero_positions.reserve(n);
    one_positions.reserve(n);

    for (int i = 1; i <= n; ++i) {
        prefix_zero[i] = prefix_zero[i - 1];
        prefix_one[i] = prefix_one[i - 1];
        if (text[i - 1] == '0') {
            ++prefix_zero[i];
            zero_positions.push_back(i);
        } else {
            ++prefix_one[i];
            one_positions.push_back(i);
        }
    }

    const int total_zero = static_cast<int>(zero_positions.size());
    const int total_one = static_cast<int>(one_positions.size());

    vector<int> pi(m, 0);
    for (int i = 1; i < m; ++i) {
        int j = pi[i - 1];
        while (j > 0 && pattern[i] != pattern[j]) {
            j = pi[j - 1];
        }
        if (pattern[i] == pattern[j]) {
            ++j;
        }
        pi[i] = j;
    }

    vector<vector<int>> next_state(m, vector<int>(2, 0));
    vector<vector<int>> add_match(m, vector<int>(2, 0));

    for (int k = 0; k < m; ++k) {
        for (int bit = 0; bit <= 1; ++bit) {
            const char ch = static_cast<char>('0' + bit);
            int x = k;
            while (x > 0 && pattern[x] != ch) {
                x = pi[x - 1];
            }
            if (pattern[x] == ch) {
                ++x;
            }
            if (x == m) {
                add_match[k][bit] = 1;
                x = pi[m - 1];
            }
            next_state[k][bit] = x;
        }
    }

    vector<vector<State>> current(total_zero + 1, vector<State>(m));
    vector<vector<State>> next_dp(total_zero + 1, vector<State>(m));
    current[0][0] = {0, 0};

    for (int i = 0; i < n; ++i) {
        for (int z = 0; z <= total_zero; ++z) {
            for (int k = 0; k < m; ++k) {
                next_dp[z][k] = State();
            }
        }

        const int min_zero_used = max(0, i - total_one);
        const int max_zero_used = min(i, total_zero);

        for (int zero_used = min_zero_used; zero_used <= max_zero_used; ++zero_used) {
            const int one_used = i - zero_used;
            for (int k = 0; k < m; ++k) {
                const State& state = current[zero_used][k];
                if (state.matches < 0) {
                    continue;
                }

                if (zero_used < total_zero) {
                    const int origin_pos = zero_positions[zero_used];
                    const int ones_before = prefix_one[origin_pos - 1];
                    const int chosen_before = zero_used + min(one_used, ones_before);
                    const int added_swaps = (origin_pos - 1) - chosen_before;

                    const int nk = next_state[k][0];
                    const int nm = state.matches + add_match[k][0];
                    const int ns = state.swaps + added_swaps;
                    relax(next_dp[zero_used + 1][nk], nm, ns);
                }

                if (one_used < total_one) {
                    const int origin_pos = one_positions[one_used];
                    const int zeros_before = prefix_zero[origin_pos - 1];
                    const int chosen_before = one_used + min(zero_used, zeros_before);
                    const int added_swaps = (origin_pos - 1) - chosen_before;

                    const int nk = next_state[k][1];
                    const int nm = state.matches + add_match[k][1];
                    const int ns = state.swaps + added_swaps;
                    relax(next_dp[zero_used][nk], nm, ns);
                }
            }
        }

        current.swap(next_dp);
    }

    State answer;
    for (int k = 0; k < m; ++k) {
        const State& candidate = current[total_zero][k];
        if (candidate.matches < 0) {
            continue;
        }
        relax(answer, candidate.matches, candidate.swaps);
    }

    cout << answer.matches << ' ' << answer.swaps << '\n';
    return 0;
}
