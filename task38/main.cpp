#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

static long long contribution(const long long value, const long long freq) {
    const long long groups = (freq + value - 1) / value;
    return groups * value;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 0;
    cin >> t;

    while (t--) {
        int n = 0;
        cin >> n;

        unordered_map<long long, long long> freq;
        freq.reserve(static_cast<size_t>(n) * 2U + 1U);

        for (int i = 0; i < n; ++i) {
            long long x = 0;
            cin >> x;
            ++freq[x];
        }

        long long base = 0;
        vector<long long> non_full_values;
        non_full_values.reserve(freq.size());

        for (const auto &entry : freq) {
            const long long value = entry.first;
            const long long f = entry.second;
            base += contribution(value, f);
            if (f % value != 0) {
                non_full_values.push_back(value);
            }
        }

        const int non_full_count = static_cast<int>(non_full_values.size());
        const long long unique_non_full =
            (non_full_count == 1 ? non_full_values[0] : -1LL);

        long long answer = -1;

        for (const auto &entry : freq) {
            const long long lie_value = entry.first;
            const long long f = entry.second;

            // Removing one report of lie_value reduces cost when we cross a block
            // boundary: ceil(f / lie_value) drops by 1.
            const long long remove_gain =
                (((f - 1) % lie_value) == 0 ? lie_value : 0LL);

            bool has_free_target = false;
            if (non_full_count >= 2) {
                has_free_target = true;
            } else if (non_full_count == 1 && unique_non_full != lie_value) {
                has_free_target = true;
            }

            // If no free target exists, we can always use a fresh color count:
            // 1 unless lie_value is 1 (then smallest different positive is 2).
            const long long add_cost =
                has_free_target ? 0LL : (lie_value == 1 ? 2LL : 1LL);

            const long long candidate = base - remove_gain + add_cost;
            if (answer == -1 || candidate < answer) {
                answer = candidate;
            }
        }

        cout << answer << '\n';
    }

    return 0;
}
